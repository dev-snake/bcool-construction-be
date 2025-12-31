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
import { SystemModule, PermissionAction } from '../../common/enums/permission.enum';

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
  @CheckPermission({ module: SystemModule.SERVICES, action: PermissionAction.CREATE })
  @Post()
  create(@Body() data: any) {
    return this.servicesService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.SERVICES, action: PermissionAction.UPDATE })
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.updateService(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.SERVICES, action: PermissionAction.DELETE })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.removeService(id);
  }
}
