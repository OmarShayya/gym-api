import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthUser } from '../../domain/interfaces/auth.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof IAuthUser, ctx: ExecutionContext): IAuthUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IAuthUser;

    return data ? user?.[data] : user;
  },
);