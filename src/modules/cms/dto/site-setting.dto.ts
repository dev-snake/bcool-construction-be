import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSiteSettingDto {
  @ApiProperty({ description: 'Setting key' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  settingKey!: string;

  @ApiPropertyOptional({ description: 'Setting value' })
  @IsString()
  @IsOptional()
  settingValue!: string;
}

export class BulkUpdateSiteSettingsDto {
  @ApiProperty({ type: [UpdateSiteSettingDto], description: 'Array of settings to update' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSiteSettingDto)
  settings!: UpdateSiteSettingDto[];
}
