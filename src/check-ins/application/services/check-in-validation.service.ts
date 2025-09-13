import { Injectable, Logger } from '@nestjs/common';
import { MemberRepository } from '../../../members/infrastructure/repositories/member.repository';

import { CheckInRepository } from '../../infrastructure/repositories/check-in.repository';
import { ICheckInValidation } from '../../domain/interfaces/check-in.interface';
import { CHECK_IN_CONSTANTS } from '../../domain/enums/check-in.enum';
import { DayPassesService } from 'src/day-passes/day-passes.service';

@Injectable()
export class CheckInValidationService {
  private readonly logger = new Logger(CheckInValidationService.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly dayPassesService: DayPassesService,
    private readonly checkInRepository: CheckInRepository,
  ) {}

  async validateMemberCheckIn(memberId: string): Promise<ICheckInValidation> {
    const member = await this.memberRepository.findByMemberId(memberId);

    if (!member) {
      return {
        isValid: false,
        canCheckIn: false,
        reason: 'Member not found',
      };
    }

    if (member.status !== 'active') {
      return {
        isValid: false,
        canCheckIn: false,
        reason: `Member account is ${member.status}`,
      };
    }

    const now = new Date();
    if (member.membershipEndDate < now) {
      return {
        isValid: false,
        canCheckIn: false,
        reason: 'Membership has expired',
        validUntil: member.membershipEndDate,
      };
    }

    const activeCheckIn = await this.checkInRepository.findActiveByMemberId(
      member._id.toString(),
    );
    if (activeCheckIn) {
      return {
        isValid: false,
        canCheckIn: false,
        reason: 'Member is already checked in',
      };
    }

    const todayCheckIns = await this.checkInRepository.countTodayCheckIns(
      member._id.toString(),
    );
    if (todayCheckIns >= CHECK_IN_CONSTANTS.MAX_DAILY_CHECKINS) {
      return {
        isValid: true,
        canCheckIn: false,
        reason: `Daily check-in limit reached (${CHECK_IN_CONSTANTS.MAX_DAILY_CHECKINS})`,
        remainingCheckIns: 0,
      };
    }

    return {
      isValid: true,
      canCheckIn: true,
      validUntil: member.membershipEndDate,
      remainingCheckIns: CHECK_IN_CONSTANTS.MAX_DAILY_CHECKINS - todayCheckIns,
    };
  }

  async validateDayPassCheckIn(passId: string): Promise<ICheckInValidation> {
    try {
      const dayPass = await this.dayPassesService.findByPassId(passId);

      if (!dayPass) {
        return {
          isValid: false,
          canCheckIn: false,
          reason: 'Day pass not found',
        };
      }

      if (dayPass.status !== 'active') {
        return {
          isValid: false,
          canCheckIn: false,
          reason: `Day pass is ${dayPass.status}`,
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const validDate = new Date(dayPass.validDate);
      validDate.setHours(0, 0, 0, 0);

      if (validDate.getTime() !== today.getTime()) {
        return {
          isValid: false,
          canCheckIn: false,
          reason: 'Day pass is not valid for today',
          validUntil: dayPass.validDate,
        };
      }

      const activeCheckIn =
        await this.checkInRepository.findActiveByDayPassId(passId);
      if (activeCheckIn) {
        return {
          isValid: false,
          canCheckIn: false,
          reason: 'Day pass is already checked in',
        };
      }

      return {
        isValid: true,
        canCheckIn: true,
        validUntil: dayPass.validDate,
        remainingCheckIns: 1,
      };
    } catch (error) {
      this.logger.error(`Day pass validation error: ${error.message}`);
      return {
        isValid: false,
        canCheckIn: false,
        reason: 'Error validating day pass',
      };
    }
  }

  async validateQrCode(qrCode: string): Promise<{
    type: 'member' | 'daypass' | null;
    id: string | null;
    validation: ICheckInValidation;
  }> {
    try {
      const qrData = JSON.parse(qrCode);
      if (qrData.type === 'MEMBER_ID' && qrData.memberId) {
        const validation = await this.validateMemberCheckIn(qrData.memberId);
        return {
          type: 'member',
          id: qrData.memberId,
          validation,
        };
      }
    } catch {
      // Not a JSON QR code, try as plain member ID
    }

    const member = await this.memberRepository.findByMemberId(qrCode);
    if (member) {
      const validation = await this.validateMemberCheckIn(member.memberId);
      return {
        type: 'member',
        id: member.memberId,
        validation,
      };
    }

    try {
      const dayPass = await this.dayPassesService.findByQrCode(qrCode);
      if (dayPass) {
        const validation = await this.validateDayPassCheckIn(dayPass.passId);
        return {
          type: 'daypass',
          id: dayPass.passId,
          validation,
        };
      }
    } catch {
      // Day pass not found
    }

    return {
      type: null,
      id: null,
      validation: {
        isValid: false,
        canCheckIn: false,
        reason: 'Invalid QR code',
      },
    };
  }
}
