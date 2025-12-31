import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
} from './dto/contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // PUBLIC
  @Post('submit')
  @ApiOperation({ summary: 'Submit contact form' })
  submit(@Body() data: CreateContactDto) {
    return this.contactService.submitForm(data);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get contact types' })
  getTypes() {
    return this.contactService.findAllTypes();
  }

  // ADMIN
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.VIEW,
  })
  @Get()
  @ApiOperation({ summary: 'List all contact submissions with pagination and filters' })
  findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findPaginatedSubmissions(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.VIEW,
  })
  @Get(':id')
  @ApiOperation({ summary: 'Get contact submission detail' })
  findOne(@Param('id') id: string) {
    return this.contactService.findDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update contact submission (status or message)' })
  updateSubmission(@Param('id') id: string, @Body() data: UpdateContactDto) {
    return this.contactService.updateSubmission(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact submission' })
  remove(@Param('id') id: string) {
    return this.contactService.softDelete(id);
  }
}
