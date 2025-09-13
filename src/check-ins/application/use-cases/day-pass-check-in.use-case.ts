import { Injectable, Logger } from '@nestjs/common';
import { CheckInRepository } from '../../infrastructure/repositories/check-in.repository';
import { CheckInMapper } from '../../infrastructure/mappers/check-in.mapper';
import { CheckInValidationService } from '../services/check-in-validation.service';

import { DayPassCheckInDto } from '../../presentation/dto/day-pass-check-in.dto';
import { ICheckInResponse } from '../../domain/interfaces/check-in.interface';
import {
  CheckInType,
  CHECK_IN_CONSTANTS,
} from '../../domain/enums/check-in.enum';
import { InvalidOperationException } from '../../../common/exceptions/business-exceptions';
import { DayPassesService } from 'src/day-passes/day-passes.service';

@Injectable()
export class DayPassCheckInUseCase {
  private readonly logger = new Logger(DayPassCheckInUseCase.name);

  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly checkInMapper: CheckInMapper,
    private readonly validationService: CheckInValidationService,
    private readonly dayPassesService: DayPassesService,
  ) {}

  async execute(dto: DayPassCheckInDto): Promise<ICheckInResponse> {
    const validation = await this.validationService.validateDayPassCheckIn(
      dto.passId,
    );

    if (!validation.canCheckIn) {
      throw new InvalidOperationException(
        validation.reason || 'Cannot check in with day pass',
      );
    }

    const dayPass = await this.dayPassesService.useDayPass(dto.passId);

    const checkInTime = new Date();
    const scheduledCheckoutTime = new Date(checkInTime);
    scheduledCheckoutTime.setHours(
      scheduledCheckoutTime.getHours() + CHECK_IN_CONSTANTS.AUTO_CHECKOUT_HOURS,
    );

    const checkInData = {
      dayPassId: dayPass.passId,
      checkInTime,
      method: dto.method,
      type: CheckInType.DAY_PASS,
      autoCheckout: true,
      scheduledCheckoutTime,
      location: dto.location,
      dayPassInfo: {
        passId: dayPass.passId,
        firstName: dayPass.firstName,
        lastName: dayPass.lastName,
        email: dayPass.email,
        phone: dayPass.phone,
        validDate: dayPass.validDate,
        amount: dayPass.amount,
      },
    };

    const checkIn = await this.checkInRepository.create(checkInData);

    this.logger.log(`Day pass ${dayPass.passId} checked in`);

    return this.checkInMapper.toResponseFromDocument(
      checkIn,
      `${dayPass.firstName} ${dayPass.lastName}`,
    );
  }
}
