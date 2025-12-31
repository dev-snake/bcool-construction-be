import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Service } from './entities/service.entity';
import { ServiceContent } from './entities/service-content.entity';
import { ServiceMedia } from './entities/service-media.entity';
import { StringUtil } from '../../common/utils/string.util';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceQueryDto,
  CreateServiceContentDto,
  CreateServiceMediaDto,
} from './dto/service.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

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

  // --- PUBLIC ---

  async findHierarchical(query: ServiceQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = { parentId: IsNull() };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    const [items, total] = await this.serviceRepository.findAndCount({
      where,
      relations: ['children', 'children.children'],
      order: { sortOrder: 'ASC' },
      skip,
      take,
    });

    return { items, total };
  }

  async findDetail(slug: string) {
    const service = await this.serviceRepository.findOne({
      where: { slug },
      relations: ['contents', 'media', 'children', 'children.children'],
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  // --- ADMIN CRUD ---

  async createService(data: CreateServiceDto) {
    const slug = data.slug || StringUtil.slugify(data.title);

    const existing = await this.serviceRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    const service = this.serviceRepository.create({
      ...data,
      slug,
    });
    return this.serviceRepository.save(service);
  }

  async updateService(id: string, data: UpdateServiceDto) {
    const service = await this.serviceRepository.findOneBy({ id } as any);
    if (!service) throw new NotFoundException('Service not found');

    if (data.title && !data.slug) {
      data.slug = StringUtil.slugify(data.title);
    }

    if (data.slug && data.slug !== service.slug) {
      const existing = await this.serviceRepository.findOne({
        where: { slug: data.slug },
      });
      if (existing) throw new ConflictException('Slug already exists');
    }

    Object.assign(service, data);
    return this.serviceRepository.save(service);
  }

  async removeService(id: string) {
    const service = await this.serviceRepository.findOneBy({ id } as any);
    if (!service) throw new NotFoundException('Service not found');
    return this.softDelete(id);
  }

  // --- CONTENT & MEDIA MANAGEMENT ---

  async addContent(serviceId: string, data: CreateServiceContentDto) {
    const item = this.contentRepository.create({
      serviceId,
      content: data.content,
    });
    return this.contentRepository.save(item);
  }

  async updateContent(id: string, data: CreateServiceContentDto) {
    const content = await this.contentRepository.findOneBy({ id } as any);
    if (!content) throw new NotFoundException('Content not found');
    content.content = data.content;
    return this.contentRepository.save(content);
  }

  async removeContent(id: string) {
    const content = await this.contentRepository.findOneBy({ id } as any);
    if (!content) throw new NotFoundException('Content not found');
    return this.contentRepository.remove(content);
  }

  async addMedia(serviceId: string, data: CreateServiceMediaDto) {
    const item = this.mediaRepository.create({
      serviceId,
      ...data,
    });
    return this.mediaRepository.save(item);
  }

  async updateMedia(id: string, data: CreateServiceMediaDto) {
    const media = await this.mediaRepository.findOneBy({ id } as any);
    if (!media) throw new NotFoundException('Media not found');
    Object.assign(media, data);
    return this.mediaRepository.save(media);
  }

  async removeMedia(id: string) {
    const media = await this.mediaRepository.findOneBy({ id } as any);
    if (!media) throw new NotFoundException('Media not found');
    return this.mediaRepository.remove(media);
  }
}
