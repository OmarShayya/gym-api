import { Injectable, Logger } from '@nestjs/common';
import { MembersService } from '../../../members/members.service';
import { TokenService } from '../services/token.service';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { IAuthTokens } from '../../domain/interfaces/auth.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import {
  InvalidTokenException,
  AccountInactiveException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto): Promise<IAuthTokens> {
    const { refreshToken } = refreshTokenDto;

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const member = await this.membersService.findById(payload.sub);
    if (!member) {
      throw new InvalidTokenException('User not found');
    }

    if (member.status !== 'active') {
      throw new AccountInactiveException();
    }

    const tokens = await this.tokenService.generateTokens(
      member._id.toString(),
      member.email,
      member.role as UserRole,
    );

    this.logger.log(`Tokens refreshed for user: ${member.email}`);

    return tokens;
  }
}
