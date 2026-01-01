import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
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
import { RedisCacheService } from '../../common/services/redis-cache.service';

@Injectable()
export class ServicesService extends BaseService<Service> {
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

  private async clearCache() {
    await this.cacheService.delByPattern('services:*');
  }

  // --- PUBLIC ---

  async findHierarchical(query: ServiceQueryDto) {
    const cacheKey = `services:list:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<{ items: Service[]; total: number }>(cacheKey);
    if (cached) return cached;

    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = { parentId: IsNull() };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    const [items, total] = await this.serviceRepository.findAndCount({
      where,
      relations: ['children', 'children.children'],
      order: { sortOrder: 'ASC' },
      skip,
      take,
    });

    const result = { items, total };
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
