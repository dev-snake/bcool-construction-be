import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Media } from './entities/media.entity';
import { CreateMediaDto, MediaQueryDto } from './dto/media.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class MediaService extends BaseService<Media> {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {
    super(mediaRepository);
  }

  async findAllMedia(query: MediaQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = {};

    if (query.uploadedById) where.uploadedById = query.uploadedById;
    if (query.fileType) where.fileType = Like(`%${query.fileType}%`);
    if (query.search) {
      where.fileName = Like(`%${query.search}%`);
    }

    const [items, total] = await this.mediaRepository.findAndCount({
      where,
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { items, total };
  }

  async findDetail(id: string) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async createMedia(data: CreateMediaDto, userId?: string) {
    const media = this.mediaRepository.create({
      ...data,
      uploadedById: userId,
    });
    return this.mediaRepository.save(media);
  }

  async removeMedia(id: string) {
    const media = await this.mediaRepository.findOneBy({ id } as any);
    if (!media) throw new NotFoundException('Media not found');
    return this.softDelete(id);
  }
}
