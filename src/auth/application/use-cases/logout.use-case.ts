import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  async execute(userId: string): Promise<{ message: string }> {
    // In a more complex implementation, you might:
    // 1. Invalidate refresh token in database
    // 2. Add access token to blacklist (if using Redis)
    // 3. Clear any server-side sessions

    this.logger.log(`User logged out: ${userId}`);

    return {
      message: 'Logged out successfully',
    };
  }
}
