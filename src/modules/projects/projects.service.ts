import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Project } from './entities/project.entity';
import { ProjectContent } from './entities/project-content.entity';
import { ProjectMedia } from './entities/project-media.entity';
import { ProjectType } from './entities/project-type.entity';
import { ProjectStatus } from './entities/project-status.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Service } from '../services/entities/service.entity';
import { CreateProjectTypeDto, UpdateProjectTypeDto } from './dto/project-type.dto';
import { CreateProjectStatusDto, UpdateProjectStatusDto } from './dto/project-status.dto';

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
    const project = this.projectRepository.create(projectData);

    if (serviceIds && serviceIds.length > 0) {
      project.services = await this.serviceRepository.find({
        where: { id: In(serviceIds) } as any,
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
      where: { id } as any,
      relations: ['services'],
    });

    if (!project) throw new NotFoundException('Project not found');

    Object.assign(project, projectData);

    if (serviceIds) {
      project.services = await this.serviceRepository.find({
        where: { id: In(serviceIds) } as any,
      });
    }

    await this.projectRepository.save(project);

    if (contents) {
      // Clear existing and replace (simple approach)
      await this.contentRepository.delete({ projectId: id });
      const contentEntities = contents.map((c) =>
        this.contentRepository.create({ ...c, projectId: id }),
      );
      await this.contentRepository.save(contentEntities);
    }

    if (media) {
      // Clear existing and replace
      await this.mediaRepository.delete({ projectId: id });
      const mediaEntities = media.map((m) =>
        this.mediaRepository.create({ ...m, projectId: id }),
      );
      await this.mediaRepository.save(mediaEntities);
    }

    return this.projectRepository.findOne({
      where: { id } as any,
      relations: ['contents', 'media', 'projectType', 'status', 'services'],
    });
  }

  // Project Type Management
  async findAllTypes() {
    return this.typeRepository.find({ order: { name: 'ASC' } });
  }

  async createType(dto: CreateProjectTypeDto) {
    const type = this.typeRepository.create(dto);
    return this.typeRepository.save(type);
  }

  async updateType(id: number, dto: UpdateProjectTypeDto) {
    await this.typeRepository.update(id, dto);
    return this.typeRepository.findOne({ where: { id } });
  }

  async removeType(id: number) {
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

  async updateStatus(id: number, dto: UpdateProjectStatusDto) {
    await this.statusRepository.update(id, dto);
    return this.statusRepository.findOne({ where: { id } });
  }

  async removeStatus(id: number) {
    return this.statusRepository.delete(id);
  }
}
