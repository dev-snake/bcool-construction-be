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

describe('Contact Module (e2e)', () => {
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
      where: { email: 'admin-e2e-contact@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-contact@test.com',
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

  describe('Contact Statuses Management', () => {
    let statusId: string;

    it('POST /contact-statuses', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/contact-statuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Request' });
      expect(response.status).toBe(201);
      statusId = response.body.id;
    });

    it('GET /contact-statuses', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contact-statuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PUT /contact-statuses/:id', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/contact-statuses/${statusId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Processed' })
        .expect(200);
    });

    it('DELETE /contact-statuses/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/contact-statuses/${statusId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Contact Types Management', () => {
    let typeId: string;

    it('POST /contact-types', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/contact-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'CONSULT', name: 'Consulting' });
      expect(response.status).toBe(201);
      typeId = response.body.id;
    });

    it('GET /contact-types', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contact-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PUT /contact-types/:id', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/contact-types/${typeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'General Consulting' })
        .expect(200);
    });

    it('DELETE /contact-types/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/contact-types/${typeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Contact Submissions', () => {
    let submissionId: string;
    let typeId: string;
    let statusId: string;

    beforeAll(async () => {
      // Create type and status for submission
      const typeRes = await request(app.getHttpServer())
        .post('/api/v1/contact-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'SUB_TYPE_' + Date.now(), name: 'Submission Type' });
      typeId = typeRes.body.id;

      const statusRes = await request(app.getHttpServer())
        .post('/api/v1/contact-statuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Submission Status' });
      statusId = statusRes.body.id;
    });

    it('POST /contact/submit (Submit - Public)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/contact/submit')
        .send({
          fullName: 'Tester',
          email: 'tester@example.com',
          phone: '0912345678',
          message: 'Help me!',
          typeId,
        });
      if (response.status !== 201) {
        console.log(
          'POST /contact/submit Failed:',
          response.status,
          JSON.stringify(response.body, null, 2),
        );
      }
      expect(response.status).toBe(201);
      submissionId = response.body.id;
    });

    it('GET /contact (Find All - Admin)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });

    it('PUT /contact/:id (Update Status - Admin)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/contact/${submissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ statusId })
        .expect(200);
    });

    it('DELETE /contact/:id (Admin)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/contact/${submissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
