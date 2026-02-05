import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TerminusModule } from '@nestjs/terminus';
import { memoryStorage } from 'multer';
import databaseConfig from '../config/database.config';
import appConfig from '../config/app.config';
import redisConfig from '../config/redis.config';
import s3Config from '../config/s3.config';
import { envValidationSchema } from '../config/env.validation';

import { DatabaseModule } from './database.module';
import { RedisProviderModule } from './redis.module';
import { SecurityModule } from './security.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig, s3Config],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false, // Show all validation errors at once
      },
    }),

    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
      },
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
