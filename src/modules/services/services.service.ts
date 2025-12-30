import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Service } from './entities/service.entity';
import { ServiceContent } from './entities/service-content.entity';
import { ServiceMedia } from './entities/service-media.entity';

@Injectable()
export class ServicesService extends BaseService<Service> {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceContent)
    private readonly contentRepository: Repository<ServiceContent>,
    @InjectRepository(ServiceMedia)
    private readonly mediaRepository: Repository<ServiceMedia>,
  ) {
    super(serviceRepository);
  }

  // TREE FETCHING
  async findHierarchical() {
    return this.serviceRepository.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ['children', 'children.children'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findDetail(slug: string) {
    const service = await this.serviceRepository.findOne({
      where: { slug },
      relations: ['contents', 'media', 'children'],
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  // CONTENT & MEDIA
  async addContent(serviceId: string, content: string) {
    const item = this.contentRepository.create({ serviceId, content });
    return this.contentRepository.save(item);
  }

  async addMedia(serviceId: string, mediaUrl: string, sortOrder: number = 0) {
    const item = this.mediaRepository.create({
      serviceId,
      mediaUrl,
      sortOrder,
    });
    return this.mediaRepository.save(item);
  }

  async updateService(id: string, data: any) {
    return this.update(id, data);
  }

  async removeService(id: string) {
    return this.softDelete(id);
  }
}
