import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectContentDto {
  @ApiProperty()
  @IsString()
  content: string;
}

export class CreateProjectMediaDto {
  @ApiProperty()
  @IsString()
  mediaUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  investor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  scale?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectTypeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startedAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @ApiProperty({ required: false, type: [CreateProjectContentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectContentDto)
  contents?: CreateProjectContentDto[];

  @ApiProperty({ required: false, type: [CreateProjectMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectMediaDto)
  media?: CreateProjectMediaDto[];
}
