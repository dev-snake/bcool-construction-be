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

describe('Media & Logs Management (e2e)', () => {
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
      where: { email: 'admin-e2e-medialog@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-medialog@test.com',
        passwordHash: 'dummy',
        isActive: true,
        roles: [adminRole],
      });
      admin = await userRepository.save(admin);
    } else {
      admin.roles = [adminRole];
      admin = await userRepository.save(admin);
    }

    adminToken = jwtService.sign({ sub: admin.id, email: admin.email });
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (app) {
      await app.close();
    }
  });

  describe('Media Management', () => {
    let mediaId: string;

    it('POST /media', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fileName: 'test-image.jpg',
          fileUrl: 'https://example.com/test-image.jpg',
          fileType: 'image/jpeg',
        });

      expect(response.status).toBe(201);
      mediaId = response.body.id;
    });

    it('GET /media', () => {
      return request(app.getHttpServer())
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });

    it('GET /media/:id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('DELETE /media/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Logs Management', () => {
    it('GET /logs/activity', () => {
      return request(app.getHttpServer())
        .get('/api/v1/logs/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });

    it('GET /logs/login', () => {
      return request(app.getHttpServer())
        .get('/api/v1/logs/login')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });
  });
});
