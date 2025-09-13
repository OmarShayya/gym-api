import { Injectable, Logger } from '@nestjs/common';
import { CheckInRepository } from '../../infrastructure/repositories/check-in.repository';
import { CheckInMapper } from '../../infrastructure/mappers/check-in.mapper';
import { CheckInValidationService } from '../services/check-in-validation.service';
import { MemberRepository } from '../../../members/infrastructure/repositories/member.repository';
import { CheckInDto } from '../../presentation/dto/check-in.dto';
import { ICheckInResponse } from '../../domain/interfaces/check-in.interface';
import {
  CheckInType,
  CHECK_IN_CONSTANTS,
} from '../../domain/enums/check-in.enum';
import { InvalidOperationException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class CheckInUseCase {
  private readonly logger = new Logger(CheckInUseCase.name);

  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly checkInMapper: CheckInMapper,
    private readonly validationService: CheckInValidationService,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(dto: CheckInDto): Promise<ICheckInResponse> {
    const validation = await this.validationService.validateMemberCheckIn(
      dto.memberId,
    );

    if (!validation.canCheckIn) {
      throw new InvalidOperationException(
        validation.reason || 'Cannot check in',
      );
    }

    const member = await this.memberRepository.findByMemberId(dto.memberId);
    if (!member) {
      throw new InvalidOperationException('Member not found');
    }

    const checkInTime = new Date();
    const scheduledCheckoutTime = new Date(checkInTime);
    scheduledCheckoutTime.setHours(
      scheduledCheckoutTime.getHours() + CHECK_IN_CONSTANTS.AUTO_CHECKOUT_HOURS,
    );

    const checkInData = {
      memberId: member._id,
      checkInTime,
      method: dto.method,
      type: CheckInType.MEMBER,
      autoCheckout: dto.autoCheckout !== false,
      scheduledCheckoutTime:
        dto.autoCheckout !== false ? scheduledCheckoutTime : null,
      location: dto.location,
      notes: dto.notes,
    };

    const checkIn = await this.checkInRepository.create(checkInData);

    await this.memberRepository.updateLastCheckIn(member._id.toString());

    this.logger.log(`Member ${member.memberId} checked in`);

    return this.checkInMapper.toResponseFromDocument(
      checkIn,
      `${member.firstName} ${member.lastName}`,
    );
  }
}
