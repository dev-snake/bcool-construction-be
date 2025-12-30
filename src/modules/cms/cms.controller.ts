import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // PUBLIC ENDPOINTS
  @Get('home')
  @ApiOperation({ summary: 'Get aggregated data for home page' })
  getHomeData() {
    return this.cmsService.getHomeData();
  }

  @Get('page/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.findOne({
      where: { slug } as any,
      relations: ['sections'],
    });
  }

  // ADMIN ENDPOINTS - BANNERS
  @UseGuards(JwtAuthGuard)
  @CheckPermission('CMS', 'can_view')
  @Get('banners')
  getBanners() {
    return this.cmsService.findAllBanners();
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('CMS', 'can_create')
  @Post('banners')
  createBanner(@Body() data: any) {
    return this.cmsService.createBanner(data);
  }

  // ADMIN ENDPOINTS - PAGES
  @UseGuards(JwtAuthGuard)
  @CheckPermission('CMS', 'can_create')
  @Post('pages')
  createPage(@Body() data: any) {
    return this.cmsService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('CMS', 'can_create')
  @Post('pages/:id/sections')
  addSection(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.addSection(id, data);
  }
}
