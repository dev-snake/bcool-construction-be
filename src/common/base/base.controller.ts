import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseEntity } from './base.entity';

export abstract class BaseController<T extends BaseEntity> {
  constructor(protected readonly service: BaseService<T>) {}

  @Post()
  async create(@Body() data: any): Promise<T> {
    return await this.service.create(data);
  }

  @Get()
  async findAll(@Query() query: any): Promise<T[]> {
    return await this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<T> {
    const entity = await this.service.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<T> {
    const entity = await this.service.update(id, data);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.service.softDelete(id);
  }
}
