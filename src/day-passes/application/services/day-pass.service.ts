import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { DAY_PASS_CONSTANTS } from '../../domain/enums/day-pass.enum';

@Injectable()
export class DayPassService {
  private readonly logger = new Logger(DayPassService.name);

  generatePassId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${DAY_PASS_CONSTANTS.QR_CODE_PREFIX}-${timestamp}-${randomPart}`.toUpperCase();
  }

  async generateQRCode(passId: string): Promise<string> {
    try {
      const qrData = {
        passId,
        type: 'DAY_PASS',
        generated: new Date().toISOString(),
      };
      return await QRCode.toDataURL(JSON.stringify(qrData));
    } catch (error) {
      this.logger.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  validateFutureDate(
    date: Date,
    maxDaysAdvance: number = DAY_PASS_CONSTANTS.ADVANCE_BOOKING_DAYS,
  ): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return false;
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDaysAdvance);

    return targetDate <= maxDate;
  }

  calculateGroupDiscount(numberOfPeople: number, basePrice: number): number {
    if (numberOfPeople >= 10) {
      return basePrice * 0.15;
    } else if (numberOfPeople >= 5) {
      return basePrice * 0.1;
    }
    return 0;
  }

  formatPassCode(passId: string): string {
    return passId.replace(/-/g, '').substring(0, 8).toUpperCase();
  }
}
