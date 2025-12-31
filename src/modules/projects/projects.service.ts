import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In, Like } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Project } from './entities/project.entity';
import { ProjectContent } from './entities/project-content.entity';
import { ProjectMedia } from './entities/project-media.entity';
import { ProjectType } from './entities/project-type.entity';
import { ProjectStatus } from './entities/project-status.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { Service } from '../services/entities/service.entity';
import { CreateProjectTypeDto, UpdateProjectTypeDto } from './dto/project-type.dto';
import { CreateProjectStatusDto, UpdateProjectStatusDto } from './dto/project-status.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectContent)
    private readonly contentRepository: Repository<ProjectContent>,
    @InjectRepository(ProjectMedia)
    private readonly mediaRepository: Repository<ProjectMedia>,
    @InjectRepository(ProjectType)
    private readonly typeRepository: Repository<ProjectType>,
    @InjectRepository(ProjectStatus)
    private readonly statusRepository: Repository<ProjectStatus>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {
    super(projectRepository);
  }

  async createProject(createProjectDto: CreateProjectDto) {
    const { serviceIds, contents, media, ...projectData } = createProjectDto;
    
    // Check if slug already exists
    const existing = await this.projectRepository.findOne({ where: { slug: projectData.slug } });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    const project = this.projectRepository.create(projectData);

    if (serviceIds && serviceIds.length > 0) {
      project.services = await this.serviceRepository.find({
        where: { id: In(serviceIds) },
      });
    }

    const savedProject = await this.projectRepository.save(project);

    if (contents && contents.length > 0) {
      const contentEntities = contents.map((c) =>
        this.contentRepository.create({ ...c, projectId: savedProject.id }),
      );
      await this.contentRepository.save(contentEntities);
    }

    if (media && media.length > 0) {
      const mediaEntities = media.map((m) =>
        this.mediaRepository.create({ ...m, projectId: savedProject.id }),
      );
      await this.mediaRepository.save(mediaEntities);
    }

    return this.findDetail(savedProject.slug);
  }

  async findDetail(slug: string) {
    const project = await this.projectRepository.findOne({
      where: { slug },
      relations: ['contents', 'media', 'projectType', 'status', 'services'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    const { serviceIds, contents, media, ...projectData } = data;
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!project) throw new NotFoundException('Project not found');

    if (projectData.slug && projectData.slug !== project.slug) {
      const existing = await this.projectRepository.findOne({ where: { slug: projectData.slug } });
      if (existing) {
        throw new ConflictException('Slug already exists');
      }
    }

    Object.assign(project, projectData);

    if (serviceIds) {
      project.services = await this.serviceRepository.find({
        where: { id: In(serviceIds) },
      });
    }

    await this.projectRepository.save(project);

    if (contents) {
      await this.contentRepository.delete({ projectId: id });
      const contentEntities = contents.map((c) =>
        this.contentRepository.create({ ...c, projectId: id }),
      );
      await this.contentRepository.save(contentEntities);
    }

    if (media) {
      await this.mediaRepository.delete({ projectId: id });
      const mediaEntities = media.map((m) =>
        this.mediaRepository.create({ ...m, projectId: id }),
      );
      await this.mediaRepository.save(mediaEntities);
    }

    return this.findDetail(project.slug);
  }

  async findAllProjects(query: ProjectQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = {};
    
    if (query.typeId) where.projectTypeId = query.typeId;
    if (query.statusId) where.statusId = query.statusId;
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.published !== undefined) where.isPublished = query.published;
    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    const [items, total] = await this.projectRepository.findAndCount({
      where,
      relations: ['projectType', 'status'],
      take,
      skip,
      order: { [query.sortBy || 'createdAt']: query.order || 'DESC' },
    });

    return { items, total };
  }

  // Project Type Management
  async findAllTypes() {
    return this.typeRepository.find({ order: { name: 'ASC' } });
  }

  async createType(dto: CreateProjectTypeDto) {
    const type = this.typeRepository.create(dto);
    return this.typeRepository.save(type);
  }

  async updateType(id: string, dto: UpdateProjectTypeDto) {
    await this.typeRepository.update(id, dto);
    return this.typeRepository.findOne({ where: { id } });
  }

  async removeType(id: string) {
    return this.typeRepository.delete(id);
  }

  // Project Status Management
  async findAllStatuses() {
    return this.statusRepository.find({ order: { name: 'ASC' } });
  }

  async createStatus(dto: CreateProjectStatusDto) {
    const status = this.statusRepository.create(dto);
    return this.statusRepository.save(status);
  }

  async updateStatus(id: string, dto: UpdateProjectStatusDto) {
    await this.statusRepository.update(id, dto);
    return this.statusRepository.findOne({ where: { id } });
  }

  async removeStatus(id: string) {
    return this.statusRepository.delete(id);
  }
}
