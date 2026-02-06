import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Banner } from './entities/banner.entity';
import { Counter } from './entities/counter.entity';
import { Branch } from './entities/branch.entity';
import { SiteSetting } from './entities/site-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageSection, Banner, Counter, Branch, SiteSetting]),
  ],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
