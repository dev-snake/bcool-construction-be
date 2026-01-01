import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeId?: string;
}

export class UpdateContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class ContactQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

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
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}


