import { Request } from 'express';
import { UserPayload } from '../decorators/current-user.decorator';

export interface RequestWithUser extends Request {
  user: UserPayload;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    memberId: string;
  };
}
