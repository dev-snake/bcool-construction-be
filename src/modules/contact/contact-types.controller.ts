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
  CreateContactTypeDto,
  UpdateContactTypeDto,
} from './dto/contact-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';

@ApiTags('Contact Types')
@Controller('contact-types')
export class ContactTypesController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contact types' })
  findAll() {
    return this.contactService.findAllTypes();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Create new contact type' })
  create(@Body() dto: CreateContactTypeDto) {
    return this.contactService.createType(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update contact type' })
  update(@Param('id') id: string, @Body() dto: UpdateContactTypeDto) {
    return this.contactService.updateType(+id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.CONTACT,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact type' })
  remove(@Param('id') id: string) {
    return this.contactService.removeType(+id);
  }
}
