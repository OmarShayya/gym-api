import { Injectable, Logger } from '@nestjs/common';
import { MembersService } from '../../../members/members.service';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { AuthEmailService } from '../services/auth-email.service';
import { LoginDto } from '../../presentation/dto/login.dto';
import { IAuthResponse } from '../../domain/interfaces/auth.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import { InvalidCredentialsException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  async execute(loginDto: LoginDto): Promise<IAuthResponse> {
    const { email, password } = loginDto;

    const member = await this.membersService.findByEmail(email);
    if (!member) {
      this.logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new InvalidCredentialsException();
    }

    await this.authService.validatePassword(password, member.password);

    const authUser = new AuthUserEntity({
      id: member._id.toString(),
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      role: member.role as UserRole,
      memberId: member.memberId,
      status: member.status as any,
      membershipStartDate: member.membershipStartDate,
      membershipEndDate: member.membershipEndDate,
      fingerprintId: member.fingerprintId,
      qrCode: member.qrCode,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    });

    this.authService.validateAccountStatus(authUser);

    const tokens = await this.tokenService.generateTokens(
      authUser.id,
      authUser.email,
      authUser.role,
    );

    await this.membersService.updateLastLogin(authUser.id);

    this.logger.log(`Successful login for user: ${email}`);

    return {
      tokens,
      user: {
        id: authUser.id,
        email: authUser.email,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        role: authUser.role,
        memberId: authUser.memberId,
        isActive: authUser.isActive,
      },
    };
  }
}
