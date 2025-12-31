import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { Transform } from 'class-transformer';

export class ProjectQueryDto extends BaseQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  featured?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;
}
