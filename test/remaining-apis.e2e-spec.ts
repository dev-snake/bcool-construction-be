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

describe('Remaining API Modules (e2e)', () => {
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
      where: { email: 'admin-e2e@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e@test.com',
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
    // Wait a bit for audit logs to finish before closing
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (app) {
      await app.close();
    }
  });

  describe('Projects Module', () => {
    it('GET /projects (Public)', () => {
      return request(app.getHttpServer()).get('/api/v1/projects').expect(200);
    });

    it('GET /projects/featured (Public)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/featured')
        .expect(200);
    });

    it('POST /projects (Admin Protected)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ title: 'Test Project', slug: 'test-project' })
        .expect(401);
    });

    it('POST /projects (Admin Authorized)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Project ' + Date.now(),
          slug: 'e2e-test-project-' + Date.now(),
        })
        .expect(201);
    });

    it('GET /projects/admin/all (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Contact Module', () => {
    it('POST /contact/submit (Public)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/contact/submit')
        .send({
          fullName: 'Test User',
          phone: '+1234567890',
          email: 'test@example.com',
          message: 'Test message',
        })
        .expect(201);
    });

    it('GET /contact/types (Public)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contact/types')
        .expect(200);
    });

    it('GET /contact (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /contact (Guest Denied)', () => {
      return request(app.getHttpServer()).get('/api/v1/contact').expect(401);
    });
  });

  describe('CMS Module', () => {
    it('GET /cms/home (Public)', () => {
      return request(app.getHttpServer()).get('/api/v1/cms/home').expect(200);
    });

    it('GET /cms/banners (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cms/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /cms/banners (Admin Authorized)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/cms/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Banner',
          imageUrl: 'https://example.com/banner.jpg',
        })
        .expect(201);
    });

    it('GET /cms/counters (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cms/counters')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /cms/pages (Admin Authorized)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/cms/pages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Page',
          slug: 'test-page-' + Date.now(),
          isPublished: true,
        })
        .expect(201);
    });
  });

  describe('Roles Module', () => {
    it('GET /roles (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /roles (Guest Denied)', () => {
      return request(app.getHttpServer()).get('/api/v1/roles').expect(401);
    });

    it('GET /roles/modules/all (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/roles/modules/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /roles (Admin Authorized)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'TEST_ROLE_' + Date.now(),
          name: 'Test Role ' + Date.now(),
        })
        .expect(201);
    });
  });
});
