import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateContactStatusDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
