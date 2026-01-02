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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateCounterDto, UpdateCounterDto } from './dto/counter.dto';
import {
  CreatePageDto,
  UpdatePageDto,
  CreatePageSectionDto,
  UpdatePageSectionDto,
} from './dto/page.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // PUBLIC ENDPOINTS
  @Public()
  @Get('home')
  @ApiOperation({ summary: 'Get aggregated data for home page' })
  getHomeData() {
    return this.cmsService.getHomeData();
  }

  @Public()
  @Get('page/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.findPageBySlug(slug);
  }

  // PUBLIC ENDPOINTS - LISTS
  @Public()
  @Get('banners')
  @ApiOperation({ summary: 'Get active banners' })
  getBanners() {
    return this.cmsService.findAllBanners(false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.CREATE,
  })
  @Post('banners')
  @ApiOperation({ summary: 'Admin: Create new banner' })
  createBanner(@Body() dto: CreateBannerDto) {
    return this.cmsService.createBanner(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.UPDATE,
  })
  @Put('banners/:id')
  @ApiOperation({ summary: 'Admin: Update banner' })
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.cmsService.updateBanner(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.DELETE,
  })
  @Delete('banners/:id')
  @ApiOperation({ summary: 'Admin: Delete banner' })
  removeBanner(@Param('id') id: string) {
    return this.cmsService.removeBanner(id);
  }

  @Public()
  @Get('counters')
  @ApiOperation({ summary: 'Get active counters' })
  getCounters() {
    return this.cmsService.findAllCounters(false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.CREATE,
  })
  @Post('counters')
  @ApiOperation({ summary: 'Admin: Create new counter' })
  createCounter(@Body() dto: CreateCounterDto) {
    return this.cmsService.createCounter(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.UPDATE,
  })
  @Put('counters/:id')
  @ApiOperation({ summary: 'Admin: Update counter' })
  updateCounter(@Param('id') id: string, @Body() dto: UpdateCounterDto) {
    return this.cmsService.updateCounter(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.DELETE,
  })
  @Delete('counters/:id')
  @ApiOperation({ summary: 'Admin: Delete counter' })
  removeCounter(@Param('id') id: string) {
    return this.cmsService.removeCounter(id);
  }

  // ADMIN ENDPOINTS - PAGES
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.CMS, action: PermissionAction.VIEW })
  @Get('pages')
  @ApiOperation({ summary: 'Admin: Get all pages' })
  getPages() {
    return this.cmsService.findAllPages();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.CMS, action: PermissionAction.VIEW })
  @Get('pages/:id')
  @ApiOperation({ summary: 'Admin: Get page detail' })
  getPage(@Param('id') id: string) {
    return this.cmsService.findPageById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.CREATE,
  })
  @Post('pages')
  @ApiOperation({ summary: 'Admin: Create new page' })
  createPage(@Body() dto: CreatePageDto) {
    return this.cmsService.createPage(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.UPDATE,
  })
  @Put('pages/:id')
  @ApiOperation({ summary: 'Admin: Update page' })
  updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.cmsService.updatePage(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.DELETE,
  })
  @Delete('pages/:id')
  @ApiOperation({ summary: 'Admin: Delete page' })
  removePage(@Param('id') id: string) {
    return this.cmsService.softDelete(id);
  }

  // ADMIN ENDPOINTS - SECTIONS
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.CREATE,
  })
  @Post('pages/:id/sections')
  @ApiOperation({ summary: 'Admin: Add section to page' })
  addSection(@Param('id') id: string, @Body() dto: CreatePageSectionDto) {
    return this.cmsService.addSection(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.UPDATE,
  })
  @Put('sections/:id')
  @ApiOperation({ summary: 'Admin: Update section' })
  updateSection(@Param('id') id: string, @Body() dto: UpdatePageSectionDto) {
    return this.cmsService.updateSection(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CMS,
    action: PermissionAction.DELETE,
  })
  @Delete('sections/:id')
  @ApiOperation({ summary: 'Admin: Delete section' })
  removeSection(@Param('id') id: string) {
    return this.cmsService.removeSection(id);
  }
}
