import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Post } from '../blog/entities/post.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectStatus } from '../projects/entities/project-status.entity';
import { Service } from '../services/entities/service.entity';
import { Contact } from '../contact/entities/contact.entity';
import { ContactStatus } from '../contact/entities/contact-status.entity';
import { Log } from '../logs/entities/log.entity';
import { ProjectStatusCode } from '../../common/enums/project-status.enum';
import { ContactStatusName } from '../../common/enums/contact-status.enum';
import { SYSTEM_USER, TIME_MS } from '../../common/constants/system.constant';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectStatus)
    private readonly projectStatusRepository: Repository<ProjectStatus>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactStatus)
    private readonly contactStatusRepository: Repository<ContactStatus>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - TIME_MS.ONE_WEEK);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // 1. Blog Stats
    const totalPosts = await this.postRepository.count();
    const newPostsThisWeek = await this.postRepository.count({
      where: { createdAt: MoreThanOrEqual(oneWeekAgo) },
    });

    // 2. Project Stats
    const inProgressStatus = await this.projectStatusRepository.findOne({
      where: { code: ProjectStatusCode.IN_PROGRESS },
    });
    const inProgressProjects = inProgressStatus
      ? await this.projectRepository.count({ where: { statusId: inProgressStatus.id } })
      : 0;
    
    const completedStatus = await this.projectStatusRepository.findOne({
      where: { code: ProjectStatusCode.COMPLETED },
    });
    const completedThisMonth = completedStatus
      ? await this.projectRepository.count({
          where: { 
            statusId: completedStatus.id,
            updatedAt: MoreThanOrEqual(oneMonthAgo)
          }
        })
      : 0;

    // 3. Service Stats (using this for Products & Materials as requested by layout)
    const totalServices = await this.serviceRepository.count();

    // 4. Contact Stats
    const newContactStatus = await this.contactStatusRepository.findOne({
      where: { name: ContactStatusName.NEW },
    });
    const pendingContacts = newContactStatus
      ? await this.contactRepository.count({ where: { statusId: newContactStatus.id } })
      : 0;

    // 5. Recent Activities
    const recentActivities = await this.logRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      stats: {
        posts: {
          total: totalPosts,
          newThisWeek: newPostsThisWeek,
        },
        projects: {
          inProgress: inProgressProjects,
          completedThisMonth: completedThisMonth,
        },
        services: {
          total: totalServices,
        },
        contacts: {
          pending: pendingContacts,
        },
      },
      recentActivities: recentActivities.map((log) => ({
        id: log.id,
        user: log.user?.fullName || SYSTEM_USER.NAME,
        action: log.action,
        module: log.module,
        target: log.recordId || '', 
        time: log.createdAt,
      })),
    };
  }
}
