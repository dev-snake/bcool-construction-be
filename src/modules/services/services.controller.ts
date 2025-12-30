import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // PUBLIC
  @Get()
  @ApiOperation({ summary: 'Get all top-level services' })
  findAll() {
    return this.servicesService.findHierarchical();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get service details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.servicesService.findDetail(slug);
  }

  // ADMIN
  @UseGuards(JwtAuthGuard)
  @CheckPermission('SERVICES', 'can_create')
  @Post()
  create(@Body() data: any) {
    return this.servicesService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('SERVICES', 'can_update')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.updateService(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('SERVICES', 'can_delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.removeService(id);
  }
}
