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

describe('CMS Module (e2e)', () => {
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
      where: { email: 'admin-e2e-cms@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-cms@test.com',
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
  }, 30000);

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (app) {
      await app.close();
    }
  });

  describe('Banners CRUD', () => {
    let bannerId: string;
    const bannerSlug =
      'e2e-test-banner-' + Date.now() + Math.random().toString(36).substring(7);

    it('POST /cms/banners', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/cms/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Banner',
          imageUrl: 'https://example.com/test-banner.jpg',
          linkUrl: 'https://example.com',
          sortOrder: 1,
        });

      expect(response.status).toBe(201);
      bannerId = response.body.id;
    });

    it('GET /cms/banners (Admin)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cms/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PUT /cms/banners/:id', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/cms/banners/${bannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title:
            'Updated E2E Test Banner ' +
            Date.now() +
            Math.random().toString(36).substring(7),
        })
        .expect(200);
    });

    it('DELETE /cms/banners/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/cms/banners/${bannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Counters CRUD', () => {
    let counterId: string;

    it('POST /cms/counters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/cms/counters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: 'E2E Projects',
          value: 100,
          sortOrder: 1,
        });

      expect(response.status).toBe(201);
      counterId = response.body.id;
    });

    it('GET /cms/counters (Admin)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cms/counters')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PUT /cms/counters/:id', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/cms/counters/${counterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 200,
          label:
            'Updated Counter ' +
            Date.now() +
            Math.random().toString(36).substring(7),
        })
        .expect(200);
    });

    it('DELETE /cms/counters/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/cms/counters/${counterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Pages & Sections CRUD', () => {
    let pageId: string;
    let sectionId: string;
    const pageSlug =
      'e2e-test-page-' + Date.now() + Math.random().toString(36).substring(7);

    it('POST /cms/pages', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/cms/pages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: pageSlug,
          title: 'E2E Test Page',
          isPublished: true,
        });

      expect(response.status).toBe(201);
      pageId = response.body.id;
    });

    it('GET /cms/pages (Admin)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cms/pages')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /cms/page/:slug (Public)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/cms/page/${pageSlug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.slug).toBe(pageSlug);
        });
    });

    it('POST /cms/pages/:id/sections', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/cms/pages/${pageId}/sections`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Section',
          content: 'Test content',
          sortOrder: 1,
        });

      expect(response.status).toBe(201);
      sectionId = response.body.id;
    });

    it('PUT /api/v1/cms/sections/:id', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/cms/sections/${sectionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title:
            'Updated E2E Section ' +
            Date.now() +
            Math.random().toString(36).substring(7),
        })
        .expect(200);
    });

    it('DELETE /api/v1/cms/sections/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/cms/sections/${sectionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('DELETE /api/v1/cms/pages/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/cms/pages/${pageId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Utility Endpoints', () => {
    it('GET /cms/home (Public)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cms/home')
        .expect(200)
        .expect((res) => {
          expect(res.body.banners).toBeDefined();
          expect(res.body.counters).toBeDefined();
        });
    });
  });
});
