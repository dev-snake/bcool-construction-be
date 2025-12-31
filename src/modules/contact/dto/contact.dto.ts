import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsInt()
  typeId?: number;
}

export class UpdateContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class ContactQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  typeId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}
