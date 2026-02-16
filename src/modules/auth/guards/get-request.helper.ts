import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function getRequestHelper(context: ExecutionContext): Express.Request {
  const contextType = context.getType<string>();
  if (contextType === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext<{ req: Express.Request }>().req;
  }
  return context.switchToHttp().getRequest();
}
