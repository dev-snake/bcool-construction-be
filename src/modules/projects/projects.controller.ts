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
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import { SystemModule, PermissionAction } from '../../common/enums/permission.enum';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published projects with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'typeId', required: false, type: Number })
  @ApiQuery({ name: 'statusId', required: false, type: Number })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('typeId') typeId?: number,
    @Query('statusId') statusId?: number,
    @Query('featured') featured?: boolean,
  ) {
    const where: any = { isPublished: true };
    if (typeId) where.projectTypeId = typeId;
    if (statusId) where.statusId = statusId;
    if (featured !== undefined) where.isFeatured = featured;

    const [items, total] = await this.projectsService.findPaginated({
      where,
      relations: ['projectType', 'status'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.PROJECTS, action: PermissionAction.VIEW })
  @Get('admin/all')
  @ApiOperation({ summary: 'Admin: Get all projects (including unpublished)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async adminFindAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const [items, total] = await this.projectsService.findPaginated({
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
      relations: ['projectType', 'status'],
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured projects' })
  findFeatured() {
    return this.projectsService.findAll({
      where: { isFeatured: true, isPublished: true },
      relations: ['projectType', 'status'],
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get project details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findDetail(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.PROJECTS, action: PermissionAction.CREATE })
  @Post()
  @ApiOperation({ summary: 'Create new project' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.PROJECTS, action: PermissionAction.UPDATE })
  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.updateProject(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.PROJECTS, action: PermissionAction.DELETE })
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete project' })
  remove(@Param('id') id: string) {
    return this.projectsService.softDelete(id);
  }
}
