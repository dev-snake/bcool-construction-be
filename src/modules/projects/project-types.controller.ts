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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectTypeDto,
  UpdateProjectTypeDto,
} from './dto/project-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';

@ApiTags('Project Types')
@Controller('project-types')
export class ProjectTypesController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all project types' })
  findAll() {
    return this.projectsService.findAllTypes();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Create new project type' })
  create(@Body() dto: CreateProjectTypeDto) {
    return this.projectsService.createType(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update project type' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectTypeDto) {
    return this.projectsService.updateType(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete project type' })
  remove(@Param('id') id: string) {
    return this.projectsService.removeType(id);
  }
}
