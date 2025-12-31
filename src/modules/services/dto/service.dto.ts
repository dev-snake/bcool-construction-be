import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class CreateServiceDto {
  @ApiPropertyOptional({ example: 'parent-uuid' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ example: 'Dịch vụ xây dựng' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'dich-vu-xay-dung' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateServiceDto extends CreateServiceDto {}

export class ServiceQueryDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateServiceContentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateServiceMediaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
