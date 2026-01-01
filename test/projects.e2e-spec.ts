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

describe('Projects Module (e2e)', () => {
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
      where: { email: 'admin-e2e-projects@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-projects@test.com',
        passwordHash: 'dummy',
        isActive: true,
        isLocked: false,
        roles: [adminRole],
      });
      admin = await userRepository.save(admin);
    } else {
      admin.roles = [adminRole];
      admin = await userRepository.save(admin);
    }

    adminToken = jwtService.sign({ sub: admin.id, email: admin.email });
  }, 30000);

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (app) {
      await app.close();
    }
  });

  describe('Project Statuses', () => {
    let statusId: string;
    const testStatusCode = 'TEST_STATUS_' + Date.now();

    it('POST /project-statuses (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/project-statuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: testStatusCode,
          name: 'Test Status',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(testStatusCode);
      statusId = response.body.id;
    });

    it('GET /project-statuses (Find All)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/project-statuses')
        .expect(200);
    });

    it('PUT /project-statuses/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/project-statuses/${statusId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Status',
        });
      if (response.status >= 400) {
        console.log(`PUT /project-statuses/${statusId} failed with ${response.status}:`, JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);
    });

    it('DELETE /project-statuses/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/project-statuses/${statusId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Project Types', () => {
    let typeId: string;
    const testTypeCode = 'TEST_TYPE_' + Date.now();

    it('POST /project-types (Create)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/project-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: testTypeCode,
          name: 'Test Type',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(testTypeCode);
      typeId = response.body.id;
    });

    it('GET /project-types (Find All)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/project-types')
        .expect(200);
    });

    it('PUT /project-types/:id (Update)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/project-types/${typeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Type',
        });
      if (response.status >= 400) {
        console.log(`PUT /project-types/${typeId} failed with ${response.status}:`, JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);
    });

    it('DELETE /project-types/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/project-types/${typeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Projects CRUD', () => {
    let projectId: string;
    let projStatusId: string;
    let projTypeId: string;
    const projectSlug = 'e2e-test-project-' + Date.now() + Math.random().toString(36).substring(7);

    beforeAll(async () => {
      // Create status and type for project
      const statusRes = await request(app.getHttpServer())
        .post('/api/v1/project-statuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'PROJ_STATUS_' + Date.now(), name: 'Project Status' });
      projStatusId = statusRes.body.id;

      const typeRes = await request(app.getHttpServer())
        .post('/api/v1/project-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'PROJ_TYPE_' + Date.now(), name: 'Project Type' });
      projTypeId = typeRes.body.id;
    });

    it('POST /projects (Create with Nested Data)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Project with Nested Data',
          slug: projectSlug,
          statusId: projStatusId,
          projectTypeId: projTypeId,
          contents: [{ content: 'Nested content' }],
          media: [{ mediaUrl: 'https://example.com/proj-nested.jpg' }]
        });

      expect(response.status).toBe(201);
      expect(response.body.slug).toBe(projectSlug);
      expect(response.body.contents).toHaveLength(1);
      expect(response.body.media).toHaveLength(1);
      projectId = response.body.id;
    });

    it('GET /projects (Public Find All)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });

    it('GET /projects (Filtering)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .query({ typeId: projTypeId, statusId: projStatusId, search: 'Nested' })
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('GET /projects/admin/all (Admin Find All)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /projects/:slug (Public Find One)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectSlug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.slug).toBe(projectSlug);
          expect(res.body.contents).toBeDefined();
        });
    });

    it('PUT /projects/:id (Update)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Test Project ' + Date.now(),
          isFeatured: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.isFeatured).toBe(true);
        });
    });

    it('DELETE /projects/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
