import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/modules/users/entities/user.entity';
import { Role } from './../src/modules/roles/entities/role.entity';

describe('Roles & Permissions (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();

    const jwtService = app.get(JwtService);
    const userRepository = app.get(getRepositoryToken(User));
    const roleRepository = app.get(getRepositoryToken(Role));

    // Ensure SUPER_ADMIN role exists
    let adminRole = await roleRepository.findOne({
      where: { code: 'SUPER_ADMIN' },
    });
    if (!adminRole) {
      adminRole = roleRepository.create({
        code: 'SUPER_ADMIN',
        name: 'Super Administrator',
      });
      await roleRepository.save(adminRole);
    }

    // Create/Update Admin User
    let admin = await userRepository.findOne({
      where: { email: 'admin-e2e-roles@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-roles@test.com',
        passwordHash: 'dummy',
        isActive: true,
        isLocked: false,
        roles: [adminRole],
      });
      await userRepository.save(admin);
    } else {
      admin.roles = [adminRole];
      await userRepository.save(admin);
    }

    adminToken = jwtService.sign({ sub: admin.id, email: admin.email });
  }, 30000);

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (app) {
      await app.close();
    }
  });

  describe('Roles CRUD', () => {
    let roleId: string;
    const testRoleCode = 'TEST_ROLE_' + Date.now();

    it('POST /roles (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: testRoleCode,
          name: 'Test Role',
          description: 'Role for e2e testing',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(testRoleCode);
      roleId = response.body.id;
    });

    it('GET /roles (Find All)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('GET /roles/:id (Find One)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(roleId);
          expect(res.body.code).toBe(testRoleCode);
        });
    });

    it('PUT /roles/:id (Update)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Role',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Test Role');
        });
    });

    it('PUT /roles/:id/permissions (Update Permissions)', async () => {
      // First create a module
      const moduleCode = 'PERM_TEST_MOD_' + Date.now();
      const modRes = await request(app.getHttpServer())
        .post('/api/v1/roles/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: moduleCode, name: 'Perm Test Module' });
      const moduleId = modRes.body.id;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/roles/${roleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissions: [
            {
              moduleId: moduleId,
              canView: true,
              canCreate: true,
              canUpdate: false,
              canDelete: false,
            },
          ],
        });

      if (response.status !== 200) {
        console.log(
          'PUT /roles/:id/permissions failed:',
          response.status,
          JSON.stringify(response.body, null, 2),
        );
      }
      expect(response.status).toBe(200);

      // Verify detail
      const detailRes = await request(app.getHttpServer())
        .get(`/api/v1/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(detailRes.body.permissions).toBeDefined();
      expect(
        detailRes.body.permissions.some((p) => p.moduleId === moduleId),
      ).toBe(true);
    });

    it('DELETE /roles/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Modules CRUD', () => {
    let moduleId: string;
    const testModuleCode = 'TEST_MODULE_' + Date.now();

    it('POST /roles/modules (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/roles/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: testModuleCode,
          name: 'Test Module',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(testModuleCode);
      moduleId = response.body.id;
    });

    it('GET /roles/modules/all (Find All)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/roles/modules/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('DELETE /roles/modules/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/roles/modules/${moduleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
