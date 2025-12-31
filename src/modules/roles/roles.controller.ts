import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  UpdateRolePermissionsDto,
} from './dto/role.dto';
import { CreateModuleDto } from './dto/module.dto';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ROLES
  @Get()
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.VIEW,
  })
  @ApiOperation({ summary: 'Get all roles' })
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.VIEW,
  })
  @ApiOperation({ summary: 'Get role detail' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findRoleById(id);
  }

  @Post()
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.CREATE,
  })
  @ApiOperation({ summary: 'Create new role' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Put(':id')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.UPDATE,
  })
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.DELETE,
  })
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string) {
    return this.rolesService.removeRole(id);
  }

  // PERMISSIONS
  @Put(':id/permissions')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.UPDATE,
  })
  @ApiOperation({ summary: 'Update role permissions' })
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updateRolePermissions(id, dto);
  }

  // MODULES
  @Get('modules/all')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.VIEW,
  })
  @ApiOperation({ summary: 'Get all system modules' })
  findAllModules() {
    return this.rolesService.findAllModules();
  }

  @Post('modules')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.CREATE,
  })
  @ApiOperation({ summary: 'Create new system module' })
  createModule(@Body() dto: CreateModuleDto) {
    return this.rolesService.createModule(dto);
  }

  @Delete('modules/:id')
  @CheckPermission({
    module: SystemModule.ROLES,
    action: PermissionAction.DELETE,
  })
  @ApiOperation({ summary: 'Delete system module' })
  removeModule(@Param('id') id: string) {
    return this.rolesService.removeModule(id);
  }
}
