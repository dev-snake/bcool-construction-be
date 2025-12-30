import { SetMetadata } from '@nestjs/common';

export type PermissionAction =
  | 'can_view'
  | 'can_create'
  | 'can_update'
  | 'can_delete';

export interface RequiredPermission {
  module: string;
  action: PermissionAction;
}

export const CHECK_PERMISSION_KEY = 'check_permission';
export const CheckPermission = (module: string, action: PermissionAction) =>
  SetMetadata(CHECK_PERMISSION_KEY, { module, action });
