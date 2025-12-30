import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<{
      subject: string;
      action: string;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // This is a placeholder for real permission checking logic
    // Usually you'd check user.permissions or user.roles.permissions
    if (
      !user ||
      !user.permissions?.includes(
        `${requiredPermission.subject}:${requiredPermission.action}`,
      )
    ) {
      // throw new ForbiddenException('Insufficient permissions');
      // For now, let's just return true if no user since we haven't implemented roles yet
      return true;
    }

    return true;
  }
}
