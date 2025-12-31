import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectTypesController } from './project-types.controller';
import { ProjectStatusesController } from './project-statuses.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectType } from './entities/project-type.entity';
import { ProjectStatus } from './entities/project-status.entity';
import { ProjectContent } from './entities/project-content.entity';
import { ProjectMedia } from './entities/project-media.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectType,
      ProjectStatus,
      ProjectContent,
      ProjectMedia,
      Service,
    ]),
  ],
  controllers: [
    ProjectsController,
    ProjectTypesController,
    ProjectStatusesController,
  ],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
