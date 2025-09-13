import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthEmailService {
  private readonly logger = new Logger(AuthEmailService.name);
  private readonly appName: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.appName = this.configService.get<string>('APP_NAME', 'Gym Management');
    this.fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@gym.com',
    );
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      // Integration with email service would go here
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      // Integration with email service would go here
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
    }
  }

  async sendAccountLockedEmail(email: string, reason: string): Promise<void> {
    try {
      // Integration with email service would go here
      this.logger.log(`Account locked notification sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send account locked email to ${email}:`,
        error,
      );
    }
  }

  async sendMembershipExpiryReminder(
    email: string,
    daysRemaining: number,
  ): Promise<void> {
    try {
      // Integration with email service would go here
      this.logger.log(`Membership expiry reminder sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send membership expiry reminder to ${email}:`,
        error,
      );
    }
  }
}
