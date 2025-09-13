import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ITokenPayload,
  IAuthTokens,
} from '../../domain/interfaces/auth.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { InvalidTokenException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'access_secret',
    );
    this.refreshTokenSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh_secret',
    );
    this.accessTokenExpiry = this.configService.get<string>(
      'JWT_ACCESS_EXPIRY',
      '15m',
    );
    this.refreshTokenExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRY',
      '7d',
    );
  }

  async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<IAuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role),
      this.generateRefreshToken(userId, email, role),
    ]);

    const expiresIn = this.getExpiryInSeconds(this.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const payload: ITokenPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiry,
    });
  }

  async generateRefreshToken(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const payload: ITokenPayload = {
      sub: userId,
      email,
      role,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiry,
    });
  }

  async verifyAccessToken(token: string): Promise<ITokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: this.accessTokenSecret,
      });

      if (payload.type !== 'access') {
        throw new InvalidTokenException('Invalid token type');
      }

      return payload;
    } catch (error) {
      this.logger.error(`Access token verification failed: ${error.message}`);
      throw new InvalidTokenException();
    }
  }

  async verifyRefreshToken(token: string): Promise<ITokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: this.refreshTokenSecret,
      });

      if (payload.type !== 'refresh') {
        throw new InvalidTokenException('Invalid token type');
      }

      return payload;
    } catch (error) {
      this.logger.error(`Refresh token verification failed: ${error.message}`);
      throw new InvalidTokenException();
    }
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  private getExpiryInSeconds(expiry: string): number {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiry.match(/(\d+)([smhd])/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1]);
    const unit = match[2] as keyof typeof units;

    return value * units[unit];
  }
}
