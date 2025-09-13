import { Injectable, Logger } from '@nestjs/common';
import { CheckInRepository } from '../../infrastructure/repositories/check-in.repository';
import { CheckInMapper } from '../../infrastructure/mappers/check-in.mapper';
import { MemberRepository } from '../../../members/infrastructure/repositories/member.repository';
import { CheckOutDto } from '../../presentation/dto/check-out.dto';
import { ICheckInResponse } from '../../domain/interfaces/check-in.interface';
import {
  CheckInStatus,
  CHECK_IN_CONSTANTS,
} from '../../domain/enums/check-in.enum';
import {
  InvalidOperationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class CheckOutUseCase {
  private readonly logger = new Logger(CheckOutUseCase.name);

  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly checkInMapper: CheckInMapper,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(dto: CheckOutDto): Promise<ICheckInResponse> {
    let checkIn = null;
    let memberName = 'Unknown';

    const member = await this.memberRepository.findByMemberId(dto.identifier);
    if (member) {
      checkIn = await this.checkInRepository.findActiveByMemberId(
        member._id.toString(),
      );
      memberName = `${member.firstName} ${member.lastName}`;
    }

    if (!checkIn) {
      checkIn = await this.checkInRepository.findActiveByDayPassId(
        dto.identifier,
      );
      if (checkIn && checkIn.dayPassInfo) {
        memberName = `${checkIn.dayPassInfo.firstName} ${checkIn.dayPassInfo.lastName}`;
      }
    }

    if (!checkIn) {
      throw new ResourceNotFoundException('Active check-in', dto.identifier);
    }

    const entity = this.checkInMapper.toEntity(checkIn);

    if (
      !entity.isValidForCheckout(
        CHECK_IN_CONSTANTS.MIN_CHECKOUT_DURATION_MINUTES,
      )
    ) {
      throw new InvalidOperationException(
        `Minimum check-in duration is ${CHECK_IN_CONSTANTS.MIN_CHECKOUT_DURATION_MINUTES} minutes`,
      );
    }

    const checkOutTime = new Date();
    entity.checkOut(checkOutTime);

    const updatedCheckIn = await this.checkInRepository.update(
      checkIn._id.toString(),
      {
        checkOutTime: entity.checkOutTime,
        duration: entity.duration,
        status: entity.status,
        notes: dto.notes
          ? `${entity.notes || ''}\n${dto.notes}`.trim()
          : entity.notes,
      },
    );

    if (!updatedCheckIn) {
      throw new ResourceNotFoundException('Check-in', checkIn._id.toString());
    }

    this.logger.log(
      `Checked out ${entity.type} ${dto.identifier} after ${entity.duration} minutes`,
    );

    return this.checkInMapper.toResponseFromDocument(
      updatedCheckIn,
      memberName,
    );
  }

  async forceCheckOut(
    checkInId: string,
    reason: string,
  ): Promise<ICheckInResponse> {
    const checkIn = await this.checkInRepository.findById(checkInId);
    if (!checkIn) {
      throw new ResourceNotFoundException('Check-in', checkInId);
    }

    const entity = this.checkInMapper.toEntity(checkIn);
    if (entity.isCompleted) {
      throw new InvalidOperationException('Check-in is already completed');
    }

    entity.checkOut();
    entity.addNote(`Force checkout: ${reason}`);

    const updatedCheckIn = await this.checkInRepository.update(checkInId, {
      checkOutTime: entity.checkOutTime,
      duration: entity.duration,
      status: entity.status,
      notes: entity.notes,
    });

    this.logger.log(`Force checked out ${checkInId}: ${reason}`);

    return this.checkInMapper.toResponseFromDocument(updatedCheckIn);
  }
}
