import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
} from './dto/create-user.dto';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.VIEW,
  })
  @ApiOperation({ summary: 'List all users with pagination' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findUsersPaginated(query);
  }

  @Get(':id')
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.VIEW,
  })
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.CREATE,
  })
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Put(':id')
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.UPDATE,
  })
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @CheckPermission({
    module: SystemModule.USERS,
    action: PermissionAction.DELETE,
  })
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}

