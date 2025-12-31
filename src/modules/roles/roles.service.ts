import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { SystemModule } from './entities/module.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto/role.dto';
import { CreateModuleDto } from './dto/module.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(SystemModule)
    private readonly moduleRepository: Repository<SystemModule>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // ROLES
  async findAllRoles() {
    return this.roleRepository.find({
      relations: ['permissions', 'permissions.module'],
      order: { name: 'ASC' },
    });
  }

  async findRoleById(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'permissions.module'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async createRole(dto: CreateRoleDto) {
    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    await this.roleRepository.update(id, dto);
    return this.findRoleById(id);
  }

  async removeRole(id: number) {
    const role = await this.findRoleById(id);
    return this.roleRepository.remove(role);
  }

  // PERMISSIONS
  async updateRolePermissions(roleId: number, dto: UpdateRolePermissionsDto) {
    const role = await this.findRoleById(roleId);

    // Create or find permissions
    const permissions: Permission[] = [];
    for (const item of dto.permissions) {
      let permission = await this.permissionRepository.findOne({
        where: {
          moduleId: item.moduleId,
          canView: item.canView,
          canCreate: item.canCreate,
          canUpdate: item.canUpdate,
          canDelete: item.canDelete,
        },
      });

      if (!permission) {
        permission = this.permissionRepository.create({
          moduleId: item.moduleId,
          canView: item.canView,
          canCreate: item.canCreate,
          canUpdate: item.canUpdate,
          canDelete: item.canDelete,
        });
        permission = await this.permissionRepository.save(permission);
      }
      permissions.push(permission);
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  // MODULES
  async findAllModules() {
    return this.moduleRepository.find({ order: { name: 'ASC' } });
  }

  async createModule(dto: CreateModuleDto) {
    const module = this.moduleRepository.create(dto);
    return this.moduleRepository.save(module);
  }

  async removeModule(id: number) {
    return this.moduleRepository.delete(id);
  }
}
