import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { LogQueryDto, LoginLogQueryDto } from './dto/log.dto';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /*
  @ApiBearerAuth()
  @CheckPermission({ module: SystemModule.LOGS, action: PermissionAction.VIEW })
  @Get('activity')
  @ApiOperation({ summary: 'Admin: Get all activity logs' })
  findAllActivity(@Query() query: LogQueryDto) {
    return this.logsService.findAllActivityLogs(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.LOGS, action: PermissionAction.VIEW })
  @Get('login')
  @ApiOperation({ summary: 'Admin: Get all login logs' })
  findAllLogin(@Query() query: LoginLogQueryDto) {
    return this.logsService.findAllLoginLogs(query);
  }
*/
}
