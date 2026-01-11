import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...(config.get('database') as Record<string, any>),
        autoLoadEntities: true,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
