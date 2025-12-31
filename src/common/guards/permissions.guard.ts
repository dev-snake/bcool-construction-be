import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_PERMISSION_KEY,
  PermissionMetadata,
  PermissionLogic,
} from '../decorators/permission.decorator';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<PermissionMetadata>(
      CHECK_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata || !metadata.permissions.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const currentUser = request.user as User;

    if (!currentUser || !currentUser.roles) {
      throw new ForbiddenException('Access denied');
    }

    // Super Admin check
    const isSuperAdmin = currentUser.roles.some(
      (role) => role.code === 'SUPER_ADMIN',
    );
    if (isSuperAdmin) {
      return true;
    }

    const { permissions, logic } = metadata;

    const checkPermission = (reqPerm: any) => {
      return currentUser.roles.some((role) =>
        role.permissions?.some(
          (perm) =>
            perm.module?.code === reqPerm.module &&
            perm[reqPerm.action] === true,
        ),
      );
    };

    let hasPermission = false;

    if (logic === PermissionLogic.AND) {
      hasPermission = permissions.every((perm) => checkPermission(perm));
    } else {
      hasPermission = permissions.some((perm) => checkPermission(perm));
    }

    if (!hasPermission) {
      const permsStr = permissions
        .map((p) => `${p.module}:${p.action}`)
        .join(logic === PermissionLogic.AND ? ' AND ' : ' OR ');
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${permsStr}`,
      );
    }

    return true;
  }
}
