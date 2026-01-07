import {
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SystemsService } from './systems.service';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { diskStorage } from 'multer';
import * as path from 'path';

@ApiTags('Systems')
@Controller('systems')
@ApiBearerAuth()
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Get('backup')
  @CheckPermission({
    module: SystemModule.USERS, // Use USERS permission for now or create a new one
    action: PermissionAction.UPDATE,
  })
  @ApiOperation({ summary: 'Create and download database backup' })
  async backup(@Res() res: Response) {
    return this.systemsService.createBackup(res);
  }

  @Get('export/users')
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.VIEW,
  })
  @ApiOperation({ summary: 'Export users to Excel' })
  async exportUsers(@Res() res: Response) {
    return this.systemsService.exportUsers(res);
  }

  @Post('import/users')
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.CREATE,
  })
  @ApiOperation({ summary: 'Import users from Excel' })
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname +
              '-' +
              uniqueSuffix +
              path.extname(file.originalname),
          );
        },
      }),
    }),
  )
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    return this.systemsService.importUsers(file);
  }
}
