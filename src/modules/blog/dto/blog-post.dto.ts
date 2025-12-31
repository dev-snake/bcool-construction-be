import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class CreatePostDto {
  @ApiProperty({ example: 'title-uuid-or-id' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Tiêu đề bài viết' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'tieu-de-bai-viet' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({ example: 'Nội dung bài viết' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  publishAt?: Date;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowComment?: boolean;
}

export class UpdatePostDto extends CreatePostDto {}

export class PostQueryDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
