import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
};

type RequestWithUser = Request & { user?: AuthUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
