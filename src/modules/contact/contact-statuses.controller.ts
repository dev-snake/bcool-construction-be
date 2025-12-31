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
import { ContactService } from './contact.service';
import {
  CreateContactStatusDto,
  UpdateContactStatusDto,
} from './dto/contact-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';

@ApiTags('Contact Statuses')
@Controller('contact-statuses')
export class ContactStatusesController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contact statuses' })
  findAll() {
    return this.contactService.findAllStatuses();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Create new contact status' })
  create(@Body() dto: CreateContactStatusDto) {
    return this.contactService.createStatus(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update contact status' })
  update(@Param('id') id: string, @Body() dto: UpdateContactStatusDto) {
    return this.contactService.updateStatus(+id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact status' })
  remove(@Param('id') id: string) {
    return this.contactService.removeStatus(+id);
  }
}
