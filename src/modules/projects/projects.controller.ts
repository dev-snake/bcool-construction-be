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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published projects' })
  findAll() {
    return this.projectsService.findAll({ where: { isPublished: true } });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured projects' })
  findFeatured() {
    return this.projectsService.findAll({
      where: { isFeatured: true, isPublished: true },
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get project details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findDetail(slug);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('PROJECTS', 'can_create')
  @Post()
  @ApiOperation({ summary: 'Create new project' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('PROJECTS', 'can_update')
  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.projectsService.updateProject(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('PROJECTS', 'can_delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete project' })
  remove(@Param('id') id: string) {
    return this.projectsService.softDelete(id);
  }
}
