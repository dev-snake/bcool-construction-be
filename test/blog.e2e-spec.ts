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

describe('Blog Management (e2e)', () => {
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
      where: { email: 'admin-e2e-blog@test.com' },
      relations: ['roles'],
    });

    if (!admin) {
      admin = userRepository.create({
        email: 'admin-e2e-blog@test.com',
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

  describe('Blog Categories CRUD', () => {
    let categoryId: string;
    const categoryName = 'E2E Category ' + Date.now() + Math.random().toString(36).substring(7);

    it('POST /blog/categories', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/blog/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: categoryName });
      if (response.status !== 201) {
        console.log('POST /blog/categories failed:', response.status, JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(201);
      categoryId = response.body.id;
    });

    it('GET /blog/categories (Public)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blog/categories')
        .expect(200);
    });

    it('PUT /blog/categories/:id', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/blog/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          name: categoryName + ' Updated',
          slug: 'updated-cat-' + Date.now() + Math.random().toString(36).substring(7)
        });
      
      if (response.status !== 200) {
        console.log(`PUT /blog/categories/${categoryId} failed:`, response.status, JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);
    });

    it('DELETE /blog/categories/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/blog/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Blog Posts CRUD', () => {
    let postId: string;
    let categoryId: string;
    const postSlug = 'e2e-test-post-' + Date.now() + Math.random().toString(36).substring(7);

    beforeAll(async () => {
        // Create a unique category for the post
        const catRes = await request(app.getHttpServer())
            .post('/api/v1/blog/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Post Category ' + Date.now() + Math.random().toString(36).substring(7) });
        
        if (catRes.status !== 201) {
          console.log('BEFORE ALL: Category creation failed:', catRes.status, JSON.stringify(catRes.body, null, 2));
        }
        
        categoryId = catRes.body.id;
    });

    it('POST /blog', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Post',
          slug: postSlug,
          content: 'Test content',
          categoryId,
          isPublished: true,
        });
      if (response.status !== 201) {
        console.log('POST /blog failed:', response.status, JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(201);
      postId = response.body.id;
    });

    it('GET /blog (Public)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blog')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toBeDefined();
        });
    });

    it('GET /blog (Filtering)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blog')
        .query({ categoryId, search: 'E2E' })
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('GET /blog/:slug (Public)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/blog/${postSlug}`)
        .expect(200);
    });

    it('PUT /blog/:id', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/blog/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          title: 'Updated E2E Post ' + Date.now() + Math.random().toString(36).substring(7),
          categoryId: categoryId, // Required by UpdatePostDto
          isPublished: true
        });
      
      if (response.status !== 200) {
        console.log(`PUT /blog/${postId} failed:`, response.status, JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);
    });

    it('DELETE /blog/categories/:id (Conflict - Should fail if posts exist)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/blog/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Based on BlogService, should throw ConflictException if category has posts
      expect(response.status).toBe(409);
    });

    it('DELETE /blog/:id', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/blog/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
