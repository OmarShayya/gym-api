import { Injectable, Logger } from '@nestjs/common';
import { MembersService } from '../../../members/members.service';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { AuthEmailService } from '../services/auth-email.service';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { IAuthResponse } from '../../domain/interfaces/auth.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { EmailAlreadyExistsException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<IAuthResponse> {
    const existingMember = await this.membersService.findByEmail(
      registerDto.email,
    );
    if (existingMember) {
      throw new EmailAlreadyExistsException(registerDto.email);
    }

    const hashedPassword = await this.authService.hashPassword(
      registerDto.password,
    );
    const memberId = this.authService.generateMemberId();
    const qrCode = this.authService.generateQrCode(memberId);

    const memberData = {
      ...registerDto,
      password: hashedPassword,
      memberId,
      qrCode,
      role: registerDto.role || UserRole.MEMBER,
      status: 'active',
    };

    const member = await this.membersService.create(memberData);

    const tokens = await this.tokenService.generateTokens(
      member._id.toString(),
      member.email,
      member.role as UserRole,
    );

    await this.authEmailService.sendWelcomeEmail(
      member.email,
      member.firstName,
    );

    this.logger.log(`New user registered: ${member.email}`);

    return {
      tokens,
      user: {
        id: member._id.toString(),
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role as UserRole,
        memberId: member.memberId,
        isActive: member.status === 'active',
      },
    };
  }
}
