import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { Log } from './entities/log.entity';
import { LoginLog } from './entities/login-log.entity';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Log, LoginLog])],
  controllers: [LogsController],
  providers: [
    LogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [LogsService],
})
export class LogsModule {}
