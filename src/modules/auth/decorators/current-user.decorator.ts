import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user as AccessTokenPayload;
    return data ? user[data] : user;
  },
);
