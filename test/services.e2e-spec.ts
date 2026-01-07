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

describe('Services Management (e2e)', () => {
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
      where: { email: 'admin-e2e-services@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-services@test.com',
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

  describe('Services CRUD', () => {
    let serviceId: string;
    const serviceSlug =
      'e2e-test-service-' +
      Date.now() +
      Math.random().toString(36).substring(7);

    it('POST /services', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Service',
          slug: serviceSlug,
          shortDescription: 'Short description for e2e',
          isActive: true,
        });

      if (response.status !== 201) {
        console.log(
          'POST /services failed:',
          response.status,
          JSON.stringify(response.body, null, 2),
        );
      }
      expect(response.status).toBe(201);
      serviceId = response.body.id;
    });

    it('GET /services (Public Hierarchical)', () => {
      return request(app.getHttpServer()).get('/api/v1/services').expect(200);
    });

    it('GET /services (Filtering)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/services')
        .query({ search: 'E2E', isActive: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('GET /services/:slug (Public Detail)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/services/${serviceSlug}`)
        .expect(200);
    });

    it('PUT /services/:id', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title:
            'Updated E2E Test Service ' +
            Date.now() +
            Math.random().toString(36).substring(7), // Required by UpdateServiceDto (extends Create)
          isActive: true,
        });

      if (response.status !== 200) {
        console.log(
          `PUT /services/${serviceId} failed:`,
          response.status,
          JSON.stringify(response.body, null, 2),
        );
      }
      expect(response.status).toBe(200);
    });

    describe('Service Content CRUD', () => {
      let contentId: string;

      it('POST /services/:id/contents', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/services/${serviceId}/contents`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ content: 'Detailed service content' });

        expect(response.status).toBe(201);
        contentId = response.body.id;
      });

      it('PUT /services/contents/:contentId', () => {
        return request(app.getHttpServer())
          .put(`/api/v1/services/contents/${contentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ content: 'Updated detailed content' })
          .expect(200);
      });

      it('DELETE /services/contents/:contentId', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/services/contents/${contentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });
    });

    describe('Service Media CRUD', () => {
      let mediaId: string;

      it('POST /services/:id/media', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/services/${serviceId}/media`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            mediaUrl: 'https://example.com/service-media.jpg',
            sortOrder: 1,
          });

        expect(response.status).toBe(201);
        mediaId = response.body.id;
      });

      it('PUT /services/media/:mediaId', () => {
        return request(app.getHttpServer())
          .put(`/api/v1/services/media/${mediaId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            mediaUrl: 'https://example.com/updated-media.jpg',
            sortOrder: 2,
          })
          .expect(200);
      });

      it('DELETE /services/media/:mediaId', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/services/media/${mediaId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });
    });

    it('DELETE /services/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
