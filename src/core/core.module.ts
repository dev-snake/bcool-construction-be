import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TerminusModule } from '@nestjs/terminus';
import databaseConfig from '../config/database.config';
import appConfig from '../config/app.config';
import redisConfig from '../config/redis.config';

import { DatabaseModule } from './database.module';
import { RedisProviderModule } from './redis.module';
import { SecurityModule } from './security.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig],
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    TerminusModule,
    DatabaseModule,
    RedisProviderModule,
    SecurityModule,
  ],
  exports: [
    ConfigModule,
    MulterModule,
    TerminusModule,
    DatabaseModule,
    RedisProviderModule,
    SecurityModule,
  ],
})
export class CoreModule {}
