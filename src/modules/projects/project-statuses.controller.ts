import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectStatusDto,
  UpdateProjectStatusDto,
} from './dto/project-status.dto';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Project Statuses')
@Controller('project-statuses')
export class ProjectStatusesController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all project statuses' })
  findAll() {
    return this.projectsService.findAllStatuses();
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Create new project status' })
  create(@Body() dto: CreateProjectStatusDto) {
    return this.projectsService.createStatus(dto);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update project status' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    return this.projectsService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.PROJECTS,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete project status' })
  remove(@Param('id') id: string) {
    return this.projectsService.removeStatus(id);
  }
}
