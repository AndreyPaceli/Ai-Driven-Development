import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '{{SHARED_PACKAGE}}';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

export const CurrentUser = createParamDecorator((field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  const user = request.user;
  return field ? user?.[field] : user;
});
