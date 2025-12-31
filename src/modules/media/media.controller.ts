import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { CreateMediaDto, MediaQueryDto } from './dto/media.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.MEDIA, action: PermissionAction.VIEW })
  @Get()
  @ApiOperation({ summary: 'Admin: Get all media files' })
  findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAllMedia(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.MEDIA, action: PermissionAction.VIEW })
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get media details' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findDetail(id);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.MEDIA,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Admin: Create media metadata' })
  create(@Body() data: CreateMediaDto, @Req() req: any) {
    return this.mediaService.createMedia(data, req.user?.id);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.MEDIA,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete media metadata' })
  remove(@Param('id') id: string) {
    return this.mediaService.removeMedia(id);
  }
}
