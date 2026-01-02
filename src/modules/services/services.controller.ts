import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceQueryDto,
  CreateServiceContentDto,
  CreateServiceMediaDto,
} from './dto/service.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // --- PUBLIC ---

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all top-level services (hierarchical)' })
  findAll(@Query() query: ServiceQueryDto) {
    return this.servicesService.findHierarchical(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get service details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.servicesService.findDetail(slug);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.VIEW,
  })
  @Get('admin/:id')
  @ApiOperation({ summary: 'Admin: Get service detail by ID' })
  getOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  // --- ADMIN SERVICES ---

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Admin: Create new service' })
  create(@Body() data: CreateServiceDto) {
    return this.servicesService.createService(data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Admin: Update service' })
  update(@Param('id') id: string, @Body() data: UpdateServiceDto) {
    return this.servicesService.updateService(id, data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete service' })
  remove(@Param('id') id: string) {
    return this.servicesService.removeService(id);
  }

  // --- ADMIN SERVICE CONTENT ---

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Post(':id/contents')
  @ApiOperation({ summary: 'Admin: Add content to service' })
  addContent(@Param('id') id: string, @Body() data: CreateServiceContentDto) {
    return this.servicesService.addContent(id, data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Put('contents/:contentId')
  @ApiOperation({ summary: 'Admin: Update service content' })
  updateContent(
    @Param('contentId') contentId: string,
    @Body() data: CreateServiceContentDto,
  ) {
    return this.servicesService.updateContent(contentId, data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Delete('contents/:contentId')
  @ApiOperation({ summary: 'Admin: Delete service content' })
  removeContent(@Param('contentId') contentId: string) {
    return this.servicesService.removeContent(contentId);
  }

  // --- ADMIN SERVICE MEDIA ---

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Post(':id/media')
  @ApiOperation({ summary: 'Admin: Add media to service' })
  addMedia(@Param('id') id: string, @Body() data: CreateServiceMediaDto) {
    return this.servicesService.addMedia(id, data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Put('media/:mediaId')
  @ApiOperation({ summary: 'Admin: Update service media' })
  updateMedia(
    @Param('mediaId') mediaId: string,
    @Body() data: CreateServiceMediaDto,
  ) {
    return this.servicesService.updateMedia(mediaId, data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.SERVICES,
    action: PermissionAction.UPDATE,
  })
  @Delete('media/:mediaId')
  @ApiOperation({ summary: 'Admin: Delete service media' })
  removeMedia(@Param('mediaId') mediaId: string) {
    return this.servicesService.removeMedia(mediaId);
  }
}
