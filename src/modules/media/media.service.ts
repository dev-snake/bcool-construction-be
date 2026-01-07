import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Media } from './entities/media.entity';
import { CreateMediaDto, MediaQueryDto } from './dto/media.dto';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';

@Injectable()
export class MediaService extends BaseService<Media> {
  protected searchableFields = ['fileName'];
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly configService: ConfigService,
  ) {
    super(mediaRepository);
    this.s3Client = new S3Client({
      region: this.configService.get<string>('s3.region') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey')!,
      },
    });
  }

  protected getQueryBuilder(
    alias: string = 'media',
  ): SelectQueryBuilder<Media> {
    return this.mediaRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.uploadedBy`, 'uploadedBy');
  }

  async uploadFile(file: Express.Multer.File, userId?: string) {
    const bucket = this.configService.get<string>('s3.bucket');
    const region = this.configService.get<string>('s3.region');
    const publicUrl = this.configService.get<string>('s3.publicUrl');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `media-${uniqueSuffix}${path.extname(file.originalname)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const fileUrl = publicUrl
      ? `${publicUrl}/${fileName}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

    const media = this.mediaRepository.create({
      fileName: file.originalname,
      fileUrl: fileUrl,
      fileType: file.mimetype,
      uploadedById: userId,
    });

    return this.mediaRepository.save(media);
  }

  async findAllMedia(query: MediaQueryDto) {
    return this.findPaginated(query, 'media', (qb) => {
      if (query.uploadedById) {
        qb.andWhere('media.uploadedById = :uploadedById', {
          uploadedById: query.uploadedById,
        });
      }
      if (query.fileType) {
        qb.andWhere('media.fileType ILIKE :fileType', {
          fileType: `%${query.fileType}%`,
        });
      }
    });
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
