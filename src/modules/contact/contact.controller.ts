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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // PUBLIC
  @Post('submit')
  @ApiOperation({ summary: 'Submit contact form' })
  submit(@Body() data: any) {
    return this.contactService.submitForm(data);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get contact types' })
  getTypes() {
    return this.contactService.findAllTypes();
  }

  // ADMIN
  @UseGuards(JwtAuthGuard)
  @CheckPermission('CONTACT', 'can_view')
  @Get()
  @ApiOperation({ summary: 'List all contact submissions' })
  findAll(@Query() query: BaseQueryDto) {
    // Basic list for now, uses BaseController logic if extended
    return this.contactService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('CONTACT', 'can_update')
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('statusId') statusId: number) {
    return this.contactService.update(id, { statusId } as any);
  }
}
