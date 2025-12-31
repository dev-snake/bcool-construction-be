import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './../src/modules/users/entities/user.entity';
import { Role } from './../src/modules/roles/entities/role.entity';

describe('Blog Management (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    // Match main.ts configuration
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
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/blog', () => {
    it('should return a list of published posts', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blog')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });
  });

  describe('Admin Operations', () => {
    it('should fail to create a category without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/blog/categories')
        .send({ name: 'Test Category' })
        .expect(403); // Due to global PermissionsGuard running before local JwtAuthGuard
    });

    it('should create a new category when authenticated as SUPER_ADMIN', async () => {
      // Note: This might still fail if global PermissionsGuard executes before local JwtAuthGuard
      const categoryName = 'Automation Test Category ' + Date.now();
      const response = await request(app.getHttpServer())
        .post('/api/v1/blog/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: categoryName });
      
      // If it fails with 403, we know it's the guard order issue
      if (response.status === 403) {
          console.warn('Warning: Request failed with 403. This is likely due to PermissionsGuard (global) running before JwtAuthGuard (local).');
      }
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(categoryName);
    });
  });
});
