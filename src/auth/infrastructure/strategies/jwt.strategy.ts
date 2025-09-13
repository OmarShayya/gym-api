import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ITokenPayload,
  IAuthUser,
} from '../../domain/interfaces/auth.interface';
import { MembersService } from '../../../members/members.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly membersService: MembersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'access_secret',
      ),
    });
  }

  async validate(payload: ITokenPayload): Promise<IAuthUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const member = await this.membersService.findById(payload.sub);
    if (!member) {
      throw new UnauthorizedException('User not found');
    }

    if (member.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    return {
      id: payload.sub,
      email: payload.email,
      firstName: member.firstName,
      lastName: member.lastName,
      role: payload.role,
      memberId: member.memberId,
      isActive: true,
    };
  }
}
