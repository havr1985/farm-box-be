import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { getRequestHelper } from '@modules/auth/guards/get-request.helper';

export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = getRequestHelper(ctx);
    const user = request.user as AccessTokenPayload;
    return data ? user[data] : user;
  },
);
