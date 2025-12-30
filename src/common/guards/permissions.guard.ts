import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/permission.decorator';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(
        CHECK_PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const currentUser = user as User;

    if (!currentUser || !currentUser.roles) {
      throw new ForbiddenException('Access denied');
    }

    // Super Admin check (optional, but good for UX)
    const isSuperAdmin = currentUser.roles.some(
      (role) => role.code === 'SUPER_ADMIN',
    );
    if (isSuperAdmin) {
      return true;
    }

    const hasPermission = currentUser.roles.some((role) =>
      role.permissions?.some(
        (perm) =>
          perm.module?.code === requiredPermission.module &&
          perm[requiredPermission.action] === true,
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions for ${requiredPermission.module}:${requiredPermission.action}`,
      );
    }

    return true;
  }
}
