import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Post } from '../blog/entities/post.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectStatus } from '../projects/entities/project-status.entity';
import { Service } from '../services/entities/service.entity';
import { Contact } from '../contact/entities/contact.entity';
import { ContactStatus } from '../contact/entities/contact-status.entity';
import { Log } from '../logs/entities/log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Project,
      ProjectStatus,
      Service,
      Contact,
      ContactStatus,
      Log,
    ]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
