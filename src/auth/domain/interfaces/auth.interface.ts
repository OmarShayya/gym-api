import { UserRole } from '../enums/user-role.enum';

export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  memberId: string;
  isActive: boolean;
}

export interface ITokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthResponse {
  tokens: IAuthTokens;
  user: IAuthUser;
}

export interface IRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  fingerprintId?: string;
  role?: UserRole;
}
