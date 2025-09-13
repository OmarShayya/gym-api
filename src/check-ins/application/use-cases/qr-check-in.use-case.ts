import { Injectable, Logger } from '@nestjs/common';
import { CheckInUseCase } from './check-in.use-case';
import { DayPassCheckInUseCase } from './day-pass-check-in.use-case';
import { CheckInValidationService } from '../services/check-in-validation.service';
import { ICheckInResponse } from '../../domain/interfaces/check-in.interface';
import { CheckInMethod } from '../../domain/enums/check-in.enum';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class QrCheckInUseCase {
  private readonly logger = new Logger(QrCheckInUseCase.name);

  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly dayPassCheckInUseCase: DayPassCheckInUseCase,
    private readonly validationService: CheckInValidationService,
  ) {}

  async execute(qrCode: string): Promise<ICheckInResponse> {
    const validationResult =
      await this.validationService.validateQrCode(qrCode);

    if (!validationResult.type || !validationResult.id) {
      throw new ResourceNotFoundException('QR Code', qrCode);
    }

    if (!validationResult.validation.canCheckIn) {
      throw new Error(validationResult.validation.reason || 'Cannot check in');
    }

    if (validationResult.type === 'member') {
      this.logger.log(`QR check-in for member: ${validationResult.id}`);
      return this.checkInUseCase.execute({
        memberId: validationResult.id,
        method: CheckInMethod.QR,
        autoCheckout: true,
      });
    } else if (validationResult.type === 'daypass') {
      this.logger.log(`QR check-in for day pass: ${validationResult.id}`);
      return this.dayPassCheckInUseCase.execute({
        passId: validationResult.id,
        method: CheckInMethod.QR,
      });
    }

    throw new ResourceNotFoundException('QR Code', qrCode);
  }
}
