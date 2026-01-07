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
import { ProjectMedia } from '../modules/projects/entities/project-media.entity';
import { Banner } from '../modules/cms/entities/banner.entity';
import { Counter } from '../modules/cms/entities/counter.entity';
import { Branch } from '../modules/cms/entities/branch.entity';
import Redis from 'ioredis';

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
      await repository.query(
        `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
      );
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
    const civilType = projectTypeRepo.create({
      code: 'CIVIL',
      name: 'Công trình dân dụng',
    });
    const industrialType = projectTypeRepo.create({
      code: 'INDUSTRIAL',
      name: 'Công trình công nghiệp',
    });
    const interiorType = projectTypeRepo.create({
      code: 'INTERIOR',
      name: 'Thiết kế nội thất',
    });
    const renovationType = projectTypeRepo.create({
      code: 'RENOVATION',
      name: 'Sửa chữa & cải tạo',
    });
    const infrastructureType = projectTypeRepo.create({
      code: 'INFRASTRUCTURE',
      name: 'Hạ tầng',
    });
    const hospitalityType = projectTypeRepo.create({
      code: 'HOSPITALITY',
      name: 'Khách sạn',
    });
    await projectTypeRepo.save([
      civilType,
      industrialType,
      interiorType,
      renovationType,
      infrastructureType,
      hospitalityType,
    ]);

    // 6. Seed Project Statuses
    console.log('Seeding project statuses...');
    const projectStatusRepo = AppDataSource.getRepository(ProjectStatus);
    const newStatus = projectStatusRepo.create({
      code: 'NEW',
      name: 'Dự án mới',
    });
    const progressStatus = projectStatusRepo.create({
      code: 'IN_PROGRESS',
      name: 'Đang thi công',
    });
    const completedStatus = projectStatusRepo.create({
      code: 'COMPLETED',
      name: 'Đã hoàn thành',
    });
    const partialStatus = projectStatusRepo.create({
      code: 'PARTIAL',
      name: 'Bàn giao một phần',
    });
    await projectStatusRepo.save([
      newStatus,
      progressStatus,
      completedStatus,
      partialStatus,
    ]);

    // 7. Seed Blog Categories
    console.log('Seeding blog categories...');
    const blogCategoryRepo = AppDataSource.getRepository(PostCategory);
    const newsCat = blogCategoryRepo.create({
      slug: 'tin-tuc',
      name: 'Tin tức',
    });
    const guideCat = blogCategoryRepo.create({
      slug: 'cam-nang-xay-dung',
      name: 'Cẩm nang xây dựng',
    });
    const promoCat = blogCategoryRepo.create({
      slug: 'khuyen-mai',
      name: 'Khuyến mãi',
    });
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

    const xaydung = await serviceRepo.save(
      serviceRepo.create({
        title: 'XÂY DỰNG TRỌN GÓI',
        slug: 'xay-dung-tron-goi',
        shortDescription:
          'Giải pháp thi công toàn diện từ nền móng đến bàn giao chìa khóa trao tay.',
        iconUrl: 'Construction',
        imageUrl:
          'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070',
        sortOrder: 1,
        isActive: true,
      }),
    );

    await serviceRepo.save(
      serviceRepo.create({
        parentId: xaydung.id,
        title: 'Xây dựng nhà phố',
        slug: 'xay-dung-nha-pho',
        shortDescription:
          'Thi công nhà phố hiện đại, tối ưu diện tích và công năng.',
        sortOrder: 1,
        isActive: true,
      }),
    );

    await serviceRepo.save(
      serviceRepo.create({
        parentId: xaydung.id,
        title: 'Xây dựng biệt thự',
        slug: 'xay-dung-biet-thu',
        shortDescription:
          'Thi công biệt thự cao cấp với tiêu chuẩn kỹ thuật khắt khe.',
        sortOrder: 2,
        isActive: true,
      }),
    );

    const thietke = await serviceRepo.save(
      serviceRepo.create({
        title: 'THIẾT KẾ KIẾN TRÚC',
        slug: 'thiet-ke-kien-truc',
        shortDescription:
          'Sáng tạo không gian sống đẳng cấp thông qua bản vẽ chi tiết và 3D.',
        iconUrl: 'PencilRuler',
        imageUrl:
          'https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2070',
        sortOrder: 2,
        isActive: true,
      }),
    );

    const suachua = await serviceRepo.save(
      serviceRepo.create({
        title: 'SỬA CHỮA & CẢI TẠO',
        slug: 'sua-chua-cai-tao',
        shortDescription:
          'Làm mới không gian sống, nâng cấp hạ tầng và sửa chữa hỏng hóc.',
        iconUrl: 'Hammer',
        imageUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070',
        sortOrder: 3,
        isActive: true,
      }),
    );

    // 11. Seed Posts
    console.log('Seeding posts...');
    const postRepo = AppDataSource.getRepository(Post);
    const posts = [
      {
        title: '5 Lưu ý quan trọng khi chuẩn bị xây dựng nhà phố năm 2024',
        slug: '5-luu-y-quan-trong-khi-xay-nha-pho',
        content:
          'Nội dung chi tiết về các lưu ý phong thủy, pháp lý và lựa chọn nhà thầu...',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
        categoryId: newsCat.id,
        isPublished: true,
        publishAt: new Date(),
      },
      {
        title: 'Xu hướng thiết kế nội thất tối giản (Minimalism) lên ngôi',
        slug: 'xu-huong-thiet-ke-noi-that-toi-gian',
        content:
          'Khám phá tại sao Minimalist là lựa chọn hàng đầu cho các căn hộ hiện đại...',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2070',
        categoryId: guideCat.id,
        isPublished: true,
        publishAt: new Date(),
      },
    ];
    await postRepo.save(postRepo.create(posts));

    // 12. Seed Projects
    console.log('Seeding projects...');
    const projectRepo = AppDataSource.getRepository(Project);
    const projectMediaRepo = AppDataSource.getRepository(ProjectMedia);

    const savedProjects = await projectRepo.save(
      projectRepo.create([
        {
          title: 'The Ritz Carlton Residences',
          slug: 'the-ritz-carlton-residences',
          shortDescription:
            'Tổ hợp căn hộ siêu sang thương hiệu Ritz-Carlton đầu tiên tại Việt Nam.',
          location: 'Hoàn Kiếm, Hà Nội',
          investor: 'Masterise Homes',
          scale: 'Tòa nhà 10 tầng, 104 căn hộ',
          projectTypeId: civilType.id,
          statusId: progressStatus.id,
          startedAt: new Date('2021-05-01'),
          isFeatured: true,
          isPublished: true,
        },
        {
          title: 'Bcool High-Tech Factory',
          slug: 'bcool-high-tech-factory',
          shortDescription:
            'Nhà máy sản xuất linh kiện điện tử chính xác cao đạt tiêu chuẩn LEED.',
          location: 'KCN VSIP II, Bình Dương',
          investor: 'Bcool Tech Corp',
          scale: '5ha - 3 nhà xưởng',
          projectTypeId: industrialType.id,
          statusId: completedStatus.id,
          startedAt: new Date('2022-03-15'),
          completedAt: new Date('2023-01-20'),
          isFeatured: true,
          isPublished: true,
        },
        {
          title: 'Sunbay Park Resort',
          slug: 'sunbay-park-resort',
          shortDescription:
            'Quần thể nghỉ dưỡng phức hợp Apart-Hotel đẳng cấp quốc tế.',
          location: 'Phan Rang, Ninh Thuận',
          investor: 'Crystal Bay Group',
          scale: '3300 căn hộ khách sạn',
          projectTypeId: hospitalityType.id,
          statusId: progressStatus.id,
          startedAt: new Date('2019-12-01'),
          isFeatured: true,
          isPublished: true,
        },
        {
          title: 'Royal City Complex',
          slug: 'royal-city-complex',
          shortDescription:
            'Khu đô thị phức hợp bậc nhất thủ đô với phong cách châu Âu tân cổ điển.',
          location: 'Thanh Xuân, Hà Nội',
          investor: 'Vingroup',
          scale: '12ha - 6 tòa tháp',
          projectTypeId: civilType.id,
          statusId: completedStatus.id,
          startedAt: new Date('2010-01-01'),
          completedAt: new Date('2013-11-20'),
          isFeatured: true,
          isPublished: true,
        },
        {
          title: 'Nhà hát Hồ Gươm',
          slug: 'nha-hat-ho-guom',
          shortDescription:
            'Công trình văn hóa biểu tượng mới giữa lòng Hà thành.',
          location: 'Hoàn Kiếm, Hà Nội',
          investor: 'Bộ Công An',
          scale: '5000m2 - 900 chỗ ngồi',
          projectTypeId: civilType.id,
          statusId: completedStatus.id,
          startedAt: new Date('2021-10-01'),
          completedAt: new Date('2023-07-09'),
          isFeatured: true,
          isPublished: true,
        },
        {
          title: 'Cầu vượt biển Tân Vũ',
          slug: 'cau-vuot-bien-tan-vu',
          shortDescription:
            'Công trình giao thông trọng điểm kết nối Cảng Lạch Huyện.',
          location: 'Hải Phòng',
          investor: 'Bộ GTVT',
          scale: 'Chiều dài 5.4km vượt biển',
          projectTypeId: infrastructureType.id,
          statusId: completedStatus.id,
          startedAt: new Date('2014-05-15'),
          completedAt: new Date('2017-09-02'),
          isFeatured: true,
          isPublished: true,
        },
      ]),
    );

    // Seed project media
    const projectMedias = [
      {
        projectId: savedProjects[0].id,
        mediaUrl:
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop',
        sortOrder: 0,
      },
      {
        projectId: savedProjects[1].id,
        mediaUrl:
          'https://plus.unsplash.com/premium_photo-1742418151224-85deebc22419?q=80&w=1075&auto=format&fit=crop',
        sortOrder: 0,
      },
      {
        projectId: savedProjects[2].id,
        mediaUrl:
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        sortOrder: 0,
      },
      {
        projectId: savedProjects[3].id,
        mediaUrl:
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
        sortOrder: 0,
      },
      {
        projectId: savedProjects[4].id,
        mediaUrl:
          'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1200&auto=format&fit=crop',
        sortOrder: 0,
      },
      {
        projectId: savedProjects[5].id,
        mediaUrl:
          'https://plus.unsplash.com/premium_photo-1725408072021-702a7c748bfd?q=80&w=1075&auto=format&fit=crop',
        sortOrder: 0,
      },
    ];

    await projectMediaRepo.save(projectMediaRepo.create(projectMedias));

    // 13. Seed CMS Banners
    console.log('Seeding banners...');
    const bannerRepo = AppDataSource.getRepository(Banner);
    const banners = [
      {
        title: 'BCOOL GROUP',
        subtitle: 'since 1993 • uy tín — tầm vóc — tri thức',
        description: 'Xây dựng bằng lương tâm và vươn tầm bằng tri thức',
        imageUrl:
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
        linkUrl: '/services',
        sortOrder: 1,
        isActive: true,
      },
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

    // 15. Seed CMS Branches
    console.log('Seeding branches...');
    const branchRepo = AppDataSource.getRepository(Branch);
    const branches = [
      {
        name: 'Hà Nội (Trụ sở chính)',
        address:
          '123 Phố Lạc Trung, phường Vĩnh Tuy, quận Hai Bà Trưng, Hà Nội',
        phone: '+84(24) 3821 7886',
        email: 'info@bcoolgroup.vn',
        workingHours: 'Thứ 2 - Thứ 7: 08:00 - 17:30',
        latitude: 21.0028,
        longitude: 105.8656,
        isMainBranch: true,
        sortOrder: 1,
      },
      {
        name: 'TP. Hồ Chí Minh',
        address:
          'Số 9 Đường D2, Saigon Pearl, 92 Nguyễn Hữu Cảnh, TP. Hồ Chí Minh',
        phone: '+84(28) 7106 4568',
        email: 'infovpdd@bcoolgroup.vn',
        workingHours: 'Thứ 2 - Thứ 7: 08:00 - 17:30',
        latitude: 10.7936,
        longitude: 106.7214,
        isMainBranch: false,
        sortOrder: 2,
      },
      {
        name: 'Văn phòng Đà Nẵng',
        address: 'Số 456 Đường Nguyễn Hữu Thọ, Quận Cẩm Lệ, TP. Đà Nẵng',
        phone: '+84(23) 6368 8888',
        email: 'danang@bcoolgroup.vn',
        workingHours: 'Thứ 2 - Thứ 7: 08:00 - 17:30',
        latitude: 16.0365,
        longitude: 108.2022,
        isMainBranch: false,
        sortOrder: 3,
      },
    ];
    await branchRepo.save(branchRepo.create(branches));

    // 16. Clear Cache
    console.log('Clearing Redis cache...');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    const patterns = ['projects:*', 'posts:*', 'services:*', 'cms:*'];
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
    await redis.quit();
    console.log('Cache cleared.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
