import { SetMetadata } from '@nestjs/common';
import { SystemModule, PermissionAction } from '../enums/permission.enum';

export interface RequiredPermission {
  module: SystemModule;
  action: PermissionAction;
}

export enum PermissionLogic {
  AND = 'AND',
  OR = 'OR',
}

export interface PermissionMetadata {
  permissions: RequiredPermission[];
  logic: PermissionLogic;
}

export const CHECK_PERMISSION_KEY = 'check_permission';

/**
 * Decorator to check for required permissions.
 * Usage:
 * @CheckPermission(SystemModule.PROJECTS, PermissionAction.CREATE)
 * @CheckPermission([{ module: SystemModule.PROJECTS, action: PermissionAction.CREATE }, { module: SystemModule.BLOG, action: PermissionAction.CREATE }], PermissionLogic.OR)
 */
export const CheckPermission = (
  permissions: RequiredPermission | RequiredPermission[],
  logic: PermissionLogic = PermissionLogic.AND,
) => {
  const perms = Array.isArray(permissions) ? permissions : [permissions];
  return SetMetadata(CHECK_PERMISSION_KEY, { permissions: perms, logic });
};
