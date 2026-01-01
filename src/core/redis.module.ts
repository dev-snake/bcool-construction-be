import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullModule } from '@nestjs/bullmq';
import { RedisCacheService } from '../common/services/redis-cache.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('redis.host')}:${config.get('redis.port')}`,
        options: {
          password: config.get('redis.password'),
        },
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
        },
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisModule, BullModule, RedisCacheService],
})
export class RedisProviderModule {}
