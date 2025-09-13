import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import { InvalidCredentialsException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async validateUser(
    email: string,
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const isPasswordValid = await this.validatePassword(
      password,
      hashedPassword,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for email: ${email}`);
      throw new InvalidCredentialsException();
    }
  }

  validateAccountStatus(user: AuthUserEntity): void {
    if (!user.isActive) {
      throw new InvalidCredentialsException('Account is not active');
    }

    if (!user.isMembershipValid) {
      throw new InvalidCredentialsException('Membership has expired');
    }
  }

  generateMemberId(): string {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `MEM-${year}-${randomNumber}`;
  }

  generateQrCode(memberId: string): string {
    return `QR-${memberId}-${Date.now()}`;
  }
}
