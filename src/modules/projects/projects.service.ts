import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Project } from './entities/project.entity';
import { ProjectContent } from './entities/project-content.entity';
import { ProjectMedia } from './entities/project-media.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectContent)
    private readonly contentRepository: Repository<ProjectContent>,
    @InjectRepository(ProjectMedia)
    private readonly mediaRepository: Repository<ProjectMedia>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {
    super(projectRepository);
  }

  async createProject(createProjectDto: CreateProjectDto) {
    const { serviceIds, ...projectData } = createProjectDto;
    const project = this.projectRepository.create(projectData);

    if (serviceIds && serviceIds.length > 0) {
      const services = await this.serviceRepository.findByIds(serviceIds);
      project.services = services;
    }

    return this.projectRepository.save(project);
  }

  async findDetail(slug: string) {
    const project = await this.projectRepository.findOne({
      where: { slug },
      relations: ['contents', 'media', 'projectType', 'status', 'services'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async addContent(projectId: string, content: string) {
    const item = this.contentRepository.create({ projectId, content });
    return this.contentRepository.save(item);
  }

  async addMedia(
    projectId: string,
    mediaUrl: string,
    caption?: string,
    sortOrder: number = 0,
  ) {
    const item = this.mediaRepository.create({
      projectId,
      mediaUrl,
      caption,
      sortOrder,
    });
    return this.mediaRepository.save(item);
  }

  async updateProject(id: string, data: any) {
    const { serviceIds, ...projectData } = data;
    const project = await this.projectRepository.findOne({
      where: { id } as any,
      relations: ['services'],
    });

    if (!project) throw new NotFoundException('Project not found');

    Object.assign(project, projectData);

    if (serviceIds) {
      const services = await this.serviceRepository.findByIds(serviceIds);
      project.services = services;
    }

    return this.projectRepository.save(project);
  }
}
