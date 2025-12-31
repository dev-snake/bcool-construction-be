import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class CreateMediaDto {
  @ApiPropertyOptional({ example: 'image.jpg' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsString()
  @IsOptional()
  fileType?: string;
}

export class MediaQueryDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  uploadedById?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileType?: string;
}
