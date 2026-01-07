import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, SelectQueryBuilder } from 'typeorm';
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
import { RedisCacheService } from '../../common/services/redis-cache.service';

@Injectable()
export class ServicesService extends BaseService<Service> {
  protected searchableFields = ['title', 'slug'];

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceContent)
    private readonly contentRepository: Repository<ServiceContent>,
    @InjectRepository(ServiceMedia)
    private readonly mediaRepository: Repository<ServiceMedia>,
    private readonly cacheService: RedisCacheService,
  ) {
    super(serviceRepository);
  }

  protected getQueryBuilder(
    alias: string = 'service',
  ): SelectQueryBuilder<Service> {
    return this.serviceRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.children`, 'children')
      .leftJoinAndSelect('children.children', 'grandChildren');
  }

  private async clearCache() {
    await this.cacheService.delByPattern('services:*');
  }

  // --- PUBLIC ---

  async findHierarchical(query: ServiceQueryDto) {
    const cacheKey = `services:list:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<{
      items: Service[];
      total: number;
    }>(cacheKey);
    if (cached) return cached;

    const { isActive } = query;

    const result = await this.findPaginated(query, 'service', (qb) => {
      qb.andWhere('service.parentId IS NULL');
      if (isActive !== undefined) {
        qb.andWhere('service.isActive = :isActive', { isActive });
      }
    });

    // Default sort for hierarchical services
    if (!query.sortBy) {
      result.items.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findDetail(slug: string) {
    const cacheKey = `services:detail:${slug}`;
    const cached = await this.cacheService.get<Service>(cacheKey);
    if (cached) return cached;

    const service = await this.serviceRepository.findOne({
      where: { slug },
      relations: ['contents', 'media', 'children', 'children.children'],
    });
    if (!service) throw new NotFoundException('Service not found');

    await this.cacheService.set(cacheKey, service, 3600);
    return service;
  }

  async findById(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id } as any,
      relations: ['contents', 'media', 'children'],
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
    const saved = await this.serviceRepository.save(service);
    await this.clearCache();
    return saved;
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
    const saved = await this.serviceRepository.save(service);
    await this.clearCache();
    return saved;
  }

  async removeService(id: string) {
    const service = await this.serviceRepository.findOneBy({ id } as any);
    if (!service) throw new NotFoundException('Service not found');
    const result = await this.softDelete(id);
    await this.clearCache();
    return result;
  }

  // --- CONTENT & MEDIA MANAGEMENT ---

  async addContent(serviceId: string, data: CreateServiceContentDto) {
    const item = this.contentRepository.create({
      serviceId,
      content: data.content,
    });
    const saved = await this.contentRepository.save(item);
    await this.clearCache();
    return saved;
  }

  async updateContent(id: string, data: CreateServiceContentDto) {
    const content = await this.contentRepository.findOneBy({ id } as any);
    if (!content) throw new NotFoundException('Content not found');
    content.content = data.content;
    const saved = await this.contentRepository.save(content);
    await this.clearCache();
    return saved;
  }

  async removeContent(id: string) {
    const content = await this.contentRepository.findOneBy({ id } as any);
    if (!content) throw new NotFoundException('Content not found');
    const result = await this.contentRepository.remove(content);
    await this.clearCache();
    return result;
  }

  async addMedia(serviceId: string, data: CreateServiceMediaDto) {
    const item = this.mediaRepository.create({
      serviceId,
      ...data,
    });
    const saved = await this.mediaRepository.save(item);
    await this.clearCache();
    return saved;
  }

  async updateMedia(id: string, data: CreateServiceMediaDto) {
    const media = await this.mediaRepository.findOneBy({ id } as any);
    if (!media) throw new NotFoundException('Media not found');
    Object.assign(media, data);
    const saved = await this.mediaRepository.save(media);
    await this.clearCache();
    return saved;
  }

  async removeMedia(id: string) {
    const media = await this.mediaRepository.findOneBy({ id } as any);
    if (!media) throw new NotFoundException('Media not found');
    const result = await this.mediaRepository.remove(media);
    await this.clearCache();
    return result;
  }
}
