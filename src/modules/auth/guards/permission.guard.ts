import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSION_KEY } from '@modules/auth/decorators/require-permission.decorator';
import { Request } from 'express';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { getUserPermissions } from '@modules/auth/constants/permissions';
import { ForbiddenException } from '@common/exceptions/app.exception';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as AccessTokenPayload;
    const userPermissions = getUserPermissions(user.roles);

    if (userPermissions.includes(requiredPermission)) {
      return true;
    }
    const basePermission = requiredPermission.replace(/:(own|farm)$/, ':any');
    if (userPermissions.includes(basePermission)) {
      return true;
    }
    throw new ForbiddenException(
      'You do not have permission to perform this action',
    );
  }
}
