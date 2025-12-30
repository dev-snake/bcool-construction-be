import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceContent } from './entities/service-content.entity';
import { ServiceMedia } from './entities/service-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceContent, ServiceMedia])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
