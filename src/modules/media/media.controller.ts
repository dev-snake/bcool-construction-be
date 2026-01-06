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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import { SystemModule, PermissionAction } from '../../common/enums/permission.enum';
import { CreateMediaDto, MediaQueryDto } from './dto/media.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.MEDIA,
    action: PermissionAction.VIEW,
  })
  @Get()
  @ApiOperation({ summary: 'Admin: Get all media files' })
  findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAllMedia(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.MEDIA,
    action: PermissionAction.VIEW,
  })
  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get media details' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.MEDIA,
    action: PermissionAction.CREATE,
  })
  @Post('upload')
  @ApiOperation({ summary: 'Admin: Upload media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.mediaService.uploadFile(file, req.user?.id);
  }

  @ApiBearerAuth()
  @CheckPermission({
    module: SystemModule.MEDIA,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Admin: Create media metadata manually' })
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
