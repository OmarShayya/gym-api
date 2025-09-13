import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);
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

  generateMemberId(): string {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `MEM-${year}-${randomNumber}`;
  }

  async generateQRCode(memberId: string): Promise<string> {
    try {
      const qrData = {
        memberId,
        type: 'MEMBER_ID',
        generated: new Date().toISOString(),
      };
      return await QRCode.toDataURL(JSON.stringify(qrData));
    } catch (error) {
      this.logger.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  calculateMembershipDaysRemaining(endDate: Date): number {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isMembershipExpiring(endDate: Date, withinDays: number = 30): boolean {
    const daysRemaining = this.calculateMembershipDaysRemaining(endDate);
    return daysRemaining > 0 && daysRemaining <= withinDays;
  }

  isMembershipExpired(endDate: Date): boolean {
    return endDate < new Date();
  }

  generateTemporaryPassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  formatMemberName(firstName: string, lastName: string): string {
    const formatName = (name: string) =>
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    return `${formatName(firstName)} ${formatName(lastName)}`;
  }
}
