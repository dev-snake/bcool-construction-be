import 'dotenv/config';
import AppDataSource from '../data-source';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { SystemModule } from '../modules/roles/entities/module.entity';
import { ProjectType } from '../modules/projects/entities/project-type.entity';
import { ProjectStatus } from '../modules/projects/entities/project-status.entity';
import { PostCategory } from '../modules/blog/entities/post-category.entity';
import { ContactType } from '../modules/contact/entities/contact-type.entity';
import { ContactStatus } from '../modules/contact/entities/contact-status.entity';

async function seed() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connected.');

    // 1. Truncate all tables
    console.log('Cleaning database...');
    const entities_list = AppDataSource.entityMetadatas;
    for (const entity of entities_list) {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
    }
    console.log('Database cleaned.');

    // 2. Seed Roles
    console.log('Seeding roles...');
    const roleRepo = AppDataSource.getRepository(Role);
    const superAdminRole = roleRepo.create({
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'System owner with full access',
    });
    const adminRole = roleRepo.create({
      code: 'ADMIN',
      name: 'Administrator',
      description: 'System administrator with limited access',
    });
    await roleRepo.save([superAdminRole, adminRole]);

    // 3. Seed Modules
    console.log('Seeding modules...');
    const moduleRepo = AppDataSource.getRepository(SystemModule);
    const modules = [
      { code: 'PROJECTS', name: 'Projects Management' },
      { code: 'SERVICES', name: 'Services Management' },
      { code: 'BLOG', name: 'Blog Management' },
      { code: 'CONTACT', name: 'Contact Management' },
      { code: 'CMS', name: 'CMS Management' },
      { code: 'MEDIA', name: 'Media Management' },
      { code: 'ROLES', name: 'Roles Management' },
      { code: 'USERS', name: 'Users Management' },
      { code: 'LOGS', name: 'Logs Management' },
    ];
    await moduleRepo.save(moduleRepo.create(modules));

    // 4. Seed Super Admin User
    console.log('Seeding super admin...');
    const userRepo = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('bcool@2024', 10);
    const adminUser = userRepo.create({
      email: 'admin@bcool.com',
      passwordHash: hashedPassword,
      fullName: 'Bcool Admin',
      isActive: true,
      roles: [superAdminRole],
    });
    await userRepo.save(adminUser);

    // 5. Seed Project Types
    console.log('Seeding project types...');
    const projectTypeRepo = AppDataSource.getRepository(ProjectType);
    const projectTypes = [
      { code: 'CIVIL', name: 'Công trình dân dụng' },
      { code: 'INDUSTRIAL', name: 'Công trình công nghiệp' },
      { code: 'INTERIOR', name: 'Thiết kế nội thất' },
      { code: 'RENOVATION', name: 'Sửa chữa & cải tạo' },
    ];
    await projectTypeRepo.save(projectTypeRepo.create(projectTypes));

    // 6. Seed Project Statuses
    console.log('Seeding project statuses...');
    const projectStatusRepo = AppDataSource.getRepository(ProjectStatus);
    const projectStatuses = [
      { code: 'NEW', name: 'Dự án mới' },
      { code: 'IN_PROGRESS', name: 'Đang thi công' },
      { code: 'COMPLETED', name: 'Đã hoàn thành' },
      { code: 'PARTIAL', name: 'Bàn giao một phần' },
    ];
    await projectStatusRepo.save(projectStatusRepo.create(projectStatuses));

    // 7. Seed Blog Categories
    console.log('Seeding blog categories...');
    const blogCategoryRepo = AppDataSource.getRepository(PostCategory);
    const blogCategories = [
      { slug: 'tin-tuc', name: 'Tin tức' },
      { slug: 'cam-nang-xay-dung', name: 'Cẩm nang xây dựng' },
      { slug: 'khuyen-mai', name: 'Khuyến mãi' },
    ];
    await blogCategoryRepo.save(blogCategoryRepo.create(blogCategories));

    // 8. Seed Contact Types
    console.log('Seeding contact types...');
    const contactTypeRepo = AppDataSource.getRepository(ContactType);
    const contactTypes = [
      { code: 'CONSULTATION', name: 'Tư vấn thiết kế' },
      { code: 'CONSTRUCTION', name: 'Thi công xây dựng' },
      { code: 'SUPPORT', name: 'Hỗ trợ kỹ thuật' },
      { code: 'OTHER', name: 'Khác' },
    ];
    await contactTypeRepo.save(contactTypeRepo.create(contactTypes));

    // 9. Seed Contact Statuses
    console.log('Seeding contact statuses...');
    const contactStatusRepo = AppDataSource.getRepository(ContactStatus);
    const contactStatuses = [
      { name: 'Mới' },
      { name: 'Đang xử lý' },
      { name: 'Đã phản hồi' },
      { name: 'Đóng' },
    ];
    await contactStatusRepo.save(contactStatusRepo.create(contactStatuses));

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
