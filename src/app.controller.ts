import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('version')
  getVersion() {
    return {
      version: process.env.npm_package_version || '0.0.1',
      commit: process.env.GIT_COMMIT || 'development',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }
}
