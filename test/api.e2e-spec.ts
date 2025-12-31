import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/modules/users/entities/user.entity';
import { Role } from './../src/modules/roles/entities/role.entity';

describe('API Management (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
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
    let adminRole = await roleRepository.findOne({ where: { code: 'SUPER_ADMIN' } });
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
      relations: ['roles']
    });
    
    if (!admin) {
        admin = userRepository.create({
            email: 'admin-e2e@test.com',
            passwordHash: 'dummy',
            isActive: true,
            isLocked: false,
            roles: [adminRole]
        });
        await userRepository.save(admin);
    } else {
        admin.roles = [adminRole];
        await userRepository.save(admin);
    }

    adminToken = jwtService.sign({ sub: admin.id, email: admin.email });
  });

  afterAll(async () => {
    // Wait a bit for audit logs to finish before closing
    await new Promise(resolve => setTimeout(resolve, 500));
    if (app) {
      await app.close();
    }
  });

  describe('Blog Module', () => {
    it('GET /blog (Public)', () => {
      return request(app.getHttpServer()).get('/api/v1/blog').expect(200);
    });

    it('POST /blog/categories (Admin Protected)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/blog/categories')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('POST /blog/categories (Admin Authorized)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/blog/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Category ' + Date.now() })
        .expect(201);
    });
  });

  describe('Services Module', () => {
    it('GET /services (Public)', () => {
      return request(app.getHttpServer()).get('/api/v1/services').expect(200);
    });

    it('POST /services (Admin Protected)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/services')
        .send({ title: 'Test Service' })
        .expect(401);
    });
  });

  describe('Logs Module', () => {
    it('GET /logs/activity (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/logs/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /logs/activity (Guest Denied)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/logs/activity')
        .expect(401);
    });
  });

  describe('Media Module', () => {
    it('GET /media (Admin Only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
