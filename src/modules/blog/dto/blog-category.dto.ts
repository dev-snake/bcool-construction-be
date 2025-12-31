import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tin tức' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'tin-tuc' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  slug?: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
