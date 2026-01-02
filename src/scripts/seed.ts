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
import { Service } from '../modules/services/entities/service.entity';
import { Post } from '../modules/blog/entities/post.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { Banner } from '../modules/cms/entities/banner.entity';
import { Counter } from '../modules/cms/entities/counter.entity';

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
    const civilType = projectTypeRepo.create({ code: 'CIVIL', name: 'Công trình dân dụng' });
    const industrialType = projectTypeRepo.create({ code: 'INDUSTRIAL', name: 'Công trình công nghiệp' });
    const interiorType = projectTypeRepo.create({ code: 'INTERIOR', name: 'Thiết kế nội thất' });
    const renovationType = projectTypeRepo.create({ code: 'RENOVATION', name: 'Sửa chữa & cải tạo' });
    await projectTypeRepo.save([civilType, industrialType, interiorType, renovationType]);

    // 6. Seed Project Statuses
    console.log('Seeding project statuses...');
    const projectStatusRepo = AppDataSource.getRepository(ProjectStatus);
    const newStatus = projectStatusRepo.create({ code: 'NEW', name: 'Dự án mới' });
    const progressStatus = projectStatusRepo.create({ code: 'IN_PROGRESS', name: 'Đang thi công' });
    const completedStatus = projectStatusRepo.create({ code: 'COMPLETED', name: 'Đã hoàn thành' });
    const partialStatus = projectStatusRepo.create({ code: 'PARTIAL', name: 'Bàn giao một phần' });
    await projectStatusRepo.save([newStatus, progressStatus, completedStatus, partialStatus]);

    // 7. Seed Blog Categories
    console.log('Seeding blog categories...');
    const blogCategoryRepo = AppDataSource.getRepository(PostCategory);
    const newsCat = blogCategoryRepo.create({ slug: 'tin-tuc', name: 'Tin tức' });
    const guideCat = blogCategoryRepo.create({ slug: 'cam-nang-xay-dung', name: 'Cẩm nang xây dựng' });
    const promoCat = blogCategoryRepo.create({ slug: 'khuyen-mai', name: 'Khuyến mãi' });
    await blogCategoryRepo.save([newsCat, guideCat, promoCat]);

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

    // 10. Seed Services
    console.log('Seeding services...');
    const serviceRepo = AppDataSource.getRepository(Service);
    
    const xaydung = await serviceRepo.save(serviceRepo.create({
      title: 'XÂY DỰNG TRỌN GÓI',
      slug: 'xay-dung-tron-goi',
      shortDescription: 'Giải pháp thi công toàn diện từ nền móng đến bàn giao chìa khóa trao tay.',
      iconUrl: 'Construction',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070',
      sortOrder: 1,
      isActive: true,
    }));

    await serviceRepo.save(serviceRepo.create({
      parentId: xaydung.id,
      title: 'Xây dựng nhà phố',
      slug: 'xay-dung-nha-pho',
      shortDescription: 'Thi công nhà phố hiện đại, tối ưu diện tích và công năng.',
      sortOrder: 1,
      isActive: true,
    }));

    await serviceRepo.save(serviceRepo.create({
      parentId: xaydung.id,
      title: 'Xây dựng biệt thự',
      slug: 'xay-dung-biet-thu',
      shortDescription: 'Thi công biệt thự cao cấp với tiêu chuẩn kỹ thuật khắt khe.',
      sortOrder: 2,
      isActive: true,
    }));

    const thietke = await serviceRepo.save(serviceRepo.create({
      title: 'THIẾT KẾ KIẾN TRÚC',
      slug: 'thiet-ke-kien-truc',
      shortDescription: 'Sáng tạo không gian sống đẳng cấp thông qua bản vẽ chi tiết và 3D.',
      iconUrl: 'PencilRuler',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2070',
      sortOrder: 2,
      isActive: true,
    }));

    const suachua = await serviceRepo.save(serviceRepo.create({
      title: 'SỬA CHỮA & CẢI TẠO',
      slug: 'sua-chua-cai-tao',
      shortDescription: 'Làm mới không gian sống, nâng cấp hạ tầng và sửa chữa hỏng hóc.',
      iconUrl: 'Hammer',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070',
      sortOrder: 3,
      isActive: true,
    }));

    // 11. Seed Posts
    console.log('Seeding posts...');
    const postRepo = AppDataSource.getRepository(Post);
    const posts = [
      {
        title: '5 Lưu ý quan trọng khi chuẩn bị xây dựng nhà phố năm 2024',
        slug: '5-luu-y-quan-trong-khi-xay-nha-pho',
        content: 'Nội dung chi tiết về các lưu ý phong thủy, pháp lý và lựa chọn nhà thầu...',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
        categoryId: newsCat.id,
        isPublished: true,
        publishAt: new Date(),
      },
      {
        title: 'Xu hướng thiết kế nội thất tối giản (Minimalism) lên ngôi',
        slug: 'xu-huong-thiet-ke-noi-that-toi-gian',
        content: 'Khám phá tại sao Minimalist là lựa chọn hàng đầu cho các căn hộ hiện đại...',
        thumbnailUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2070',
        categoryId: guideCat.id,
        isPublished: true,
        publishAt: new Date(),
      }
    ];
    await postRepo.save(postRepo.create(posts));

    // 12. Seed Projects
    console.log('Seeding projects...');
    const projectRepo = AppDataSource.getRepository(Project);
    const projects = [
      {
        title: 'Biệt thự sân vườn Anh Hùng - Bình Dương',
        slug: 'biet-thu-anh-hung-binh-duong',
        shortDescription: 'Dự án biệt thự cao cấp phong cách Hiện đại kết hợp không gian xanh.',
        location: 'Dĩ An, Bình Dương',
        investor: 'Ông Nguyễn Văn Hùng',
        scale: '500m2 - 3 tầng',
        projectTypeId: civilType.id,
        statusId: completedStatus.id,
        startedAt: new Date('2023-01-15'),
        completedAt: new Date('2023-10-20'),
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Căn hộ Penthouse The View - Quận 7',
        slug: 'penthouse-the-view-q7',
        shortDescription: 'Cải tạo và thiết kế nội thất căn hộ Penthouse sang trọng.',
        location: 'Quận 7, TP. HCM',
        investor: 'Bà Lê Thị Mai',
        scale: '250m2',
        projectTypeId: interiorType.id,
        statusId: progressStatus.id,
        startedAt: new Date('2024-02-01'),
        isFeatured: true,
        isPublished: true,
      }
    ];
    await projectRepo.save(projectRepo.create(projects));

    // 13. Seed CMS Banners
    console.log('Seeding banners...');
    const bannerRepo = AppDataSource.getRepository(Banner);
    const banners = [
      {
        title: 'BCOOL GROUP',
        subtitle: 'since 1993 • uy tín — tầm vóc — tri thức',
        description: 'Xây dựng bằng lương tâm và vươn tầm bằng tri thức',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
        linkUrl: '/services',
        sortOrder: 1,
        isActive: true,
      }
    ];
    await bannerRepo.save(bannerRepo.create(banners));

    // 14. Seed CMS Counters
    console.log('Seeding counters...');
    const counterRepo = AppDataSource.getRepository(Counter);
    const counters = [
      { label: 'Năm kinh nghiệm', value: 12, sortOrder: 1 },
      { label: 'Dự án hoàn thành', value: 350, sortOrder: 2 },
      { label: 'Khách hàng tin tưởng', value: 500, sortOrder: 3 },
      { label: 'Nhân sự thâm niên', value: 45, sortOrder: 4 },
    ];
    await counterRepo.save(counterRepo.create(counters));

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
