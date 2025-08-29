import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserPayload }>();
    return request.user as UserPayload;
  },
);
