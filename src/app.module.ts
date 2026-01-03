import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CmsModule } from './modules/cms/cms.module';
import { ServicesModule } from './modules/services/services.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { MediaModule } from './modules/media/media.module';
import { LogsModule } from './modules/logs/logs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { StatsModule } from './modules/stats/stats.module';
// import { SystemsModule } from './modules/systems/systems.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CmsModule,
    ServicesModule,
    BlogModule,
    ContactModule,
    MediaModule,
    LogsModule,
    ProjectsModule,
    StatsModule,
    // SystemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
