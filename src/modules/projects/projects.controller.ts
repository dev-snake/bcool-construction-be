import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published projects' })
  async findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAllProjects({ ...query, published: true });
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.VIEW,
  })
  @Get('admin/all')
  @ApiOperation({ summary: 'Admin: Get all projects (including unpublished)' })
  async adminFindAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAllProjects(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured projects' })
  findFeatured(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAllProjects({
      ...query,
      featured: true,
      published: true,
    });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get project details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findDetail(slug);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Create new project' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.updateProject(id, data);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete project' })
  remove(@Param('id') id: string) {
    return this.projectsService.softDelete(id);
  }
}
