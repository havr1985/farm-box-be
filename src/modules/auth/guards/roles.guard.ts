import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '@modules/users/entities/user.entity';
import { ROLES_KEY } from '@modules/auth/decorators/roles.decorator';
import { Request } from 'express';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { ForbiddenException } from '@common/exceptions/app.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const req: Request = context.switchToHttp().getRequest();
    const user = req.user as AccessTokenPayload;
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to access this resource',
      );
    }
    return true;
  }
}
