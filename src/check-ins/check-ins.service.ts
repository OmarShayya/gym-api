/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CheckIn, CheckInDocument } from './schemas/check-in.schema';
import { MembersService } from '../members/members.service';
import { DayPassesService } from '../day-passes/day-passes.service';
import { CheckInDto, CheckOutDto, CheckInMethod } from './dto/check-in.dto';
import { CheckInResponseDto } from './dto/check-in-response.dto';
import { MemberDocument } from '../members/infrastructure/schemas/member.schema';

type CheckInWithMember = Omit<CheckInDocument, 'memberId'> & {
  memberId: MemberDocument;
};

export class DayPassCheckInDto {
  passId: string;
  method: CheckInMethod;
}

@Injectable()
export class CheckInsService {
  constructor(
    @InjectModel(CheckIn.name)
    private readonly checkInModel: Model<CheckInDocument>,
    private readonly membersService: MembersService,
    private readonly dayPassesService: DayPassesService,
  ) {}

  async checkIn(checkInDto: CheckInDto): Promise<CheckInResponseDto> {
    const member = await this.membersService.findByMemberId(
      checkInDto.memberId,
    );

    if (member.status !== 'active') {
      throw new BadRequestException('Member account is not active');
    }

    const now = new Date();
    if (new Date(member.membershipEndDate) < now) {
      throw new BadRequestException('Membership has expired');
    }

    const existingCheckIn = await this.checkInModel
      .findOne({
        memberId: member._id,
        checkOutTime: null,
      })
      .exec();

    if (existingCheckIn) {
      throw new BadRequestException('Member is already checked in');
    }

    const checkIn = new this.checkInModel({
      memberId: member._id,
      checkInTime: new Date(),
      checkInMethod: checkInDto.method,
    });

    const savedCheckIn = await checkIn.save();

    return this.formatCheckInResponse(savedCheckIn, member);
  }

  async checkInWithDayPass(
    dayPassCheckInDto: DayPassCheckInDto,
  ): Promise<CheckInResponseDto> {
    try {
      const dayPass = await this.dayPassesService.useDayPass(
        dayPassCheckInDto.passId,
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingCheckIn = await this.checkInModel
        .findOne({
          'dayPassInfo.passId': dayPass.passId,
          checkInTime: {
            $gte: today,
            $lt: tomorrow,
          },
          checkOutTime: null,
        })
        .exec();

      if (existingCheckIn) {
        throw new BadRequestException('Day pass is already checked in');
      }

      const checkIn = new this.checkInModel({
        checkInTime: new Date(),
        checkInMethod: dayPassCheckInDto.method,
        dayPassInfo: {
          passId: dayPass.passId,
          firstName: dayPass.firstName,
          lastName: dayPass.lastName,
          email: dayPass.email,
          phone: dayPass.phone,
          validDate: dayPass.validDate,
          amount: dayPass.amount,
        },
      });

      const savedCheckIn = await checkIn.save();
      return this.formatDayPassCheckInResponse(savedCheckIn, dayPass);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to check in with day pass');
    }
  }

  async checkInByQrCode(qrCode: string): Promise<CheckInResponseDto> {
    try {
      const member = await this.membersService.findByQrCode(qrCode);
      if (member) {
        return this.checkIn({
          memberId: member.memberId,
          method: CheckInMethod.QR,
        });
      }
    } catch {
      // Member not found, try day pass
    }

    try {
      const dayPass = await this.dayPassesService.findByQrCode(qrCode);
      if (dayPass) {
        return this.checkInWithDayPass({
          passId: dayPass.passId,
          method: CheckInMethod.QR,
        });
      }
    } catch {
      // Day pass not found
    }

    throw new NotFoundException(
      'No valid membership or day pass found for this QR code',
    );
  }

  async checkOut(checkOutDto: CheckOutDto): Promise<CheckInResponseDto> {
    let checkIn: CheckInDocument | null = null;
    let member: MemberDocument | null = null;

    try {
      member = await this.membersService.findByMemberId(checkOutDto.memberId);
      checkIn = await this.checkInModel
        .findOne({
          memberId: member._id,
          checkOutTime: null,
        })
        .exec();
    } catch {
      // Member not found, could be a day pass checkout
    }

    if (!checkIn) {
      checkIn = await this.checkInModel
        .findOne({
          'dayPassInfo.passId': checkOutDto.memberId,
          checkOutTime: null,
        })
        .exec();
    }

    if (!checkIn) {
      throw new BadRequestException('No active check-in found');
    }

    const checkOutTime = new Date();
    const duration = Math.floor(
      (checkOutTime.getTime() - checkIn.checkInTime.getTime()) / 60000,
    );

    checkIn.checkOutTime = checkOutTime;
    checkIn.duration = duration;

    const savedCheckIn = await checkIn.save();

    if (member) {
      return this.formatCheckInResponse(savedCheckIn, member);
    } else {
      const dayPassInfo = checkIn.dayPassInfo;
      return this.formatDayPassCheckInResponse(savedCheckIn, {
        passId: dayPassInfo?.passId,
        firstName: dayPassInfo?.firstName,
        lastName: dayPassInfo?.lastName,
        email: dayPassInfo?.email,
        phone: dayPassInfo?.phone,
        validDate: dayPassInfo?.validDate,
        amount: dayPassInfo?.amount,
        status: 'used',
      } as any);
    }
  }

  async getMemberCheckIns(
    memberId: string,
    limit?: number,
  ): Promise<CheckInResponseDto[]> {
    const member = await this.membersService.findByMemberId(memberId);

    const query = this.checkInModel
      .find({ memberId: member._id })
      .sort({ checkInTime: -1 });

    if (limit) {
      query.limit(limit);
    }

    const checkIns = await query.exec();

    return checkIns.map((checkIn) =>
      this.formatCheckInResponse(checkIn, member),
    );
  }

  async getActiveCheckIns(): Promise<CheckInResponseDto[]> {
    const checkIns = await this.checkInModel
      .find({ checkOutTime: null })
      .populate('memberId')
      .sort({ checkInTime: -1 })
      .exec();

    return checkIns.map((checkIn) => {
      if (checkIn.memberId) {
        const checkInWithMember = checkIn as unknown as CheckInWithMember;
        return this.formatCheckInResponse(
          checkInWithMember,
          checkInWithMember.memberId,
        );
      } else {
        const dayPassInfo = checkIn.dayPassInfo;
        return this.formatDayPassCheckInResponse(checkIn, {
          passId: dayPassInfo?.passId,
          firstName: dayPassInfo?.firstName,
          lastName: dayPassInfo?.lastName,
          email: dayPassInfo?.email,
          phone: dayPassInfo?.phone,
          validDate: dayPassInfo?.validDate,
          amount: dayPassInfo?.amount,
          status: 'used',
        } as any);
      }
    });
  }

  async getTodaysCheckIns(): Promise<CheckInResponseDto[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const checkIns = await this.checkInModel
      .find({
        checkInTime: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate('memberId')
      .sort({ checkInTime: -1 })
      .exec();

    return checkIns.map((checkIn) => {
      if (checkIn.memberId) {
        const checkInWithMember = checkIn as unknown as CheckInWithMember;
        return this.formatCheckInResponse(
          checkInWithMember,
          checkInWithMember.memberId,
        );
      } else {
        const dayPassInfo = checkIn.dayPassInfo;
        return this.formatDayPassCheckInResponse(checkIn, {
          passId: dayPassInfo?.passId,
          firstName: dayPassInfo?.firstName,
          lastName: dayPassInfo?.lastName,
          email: dayPassInfo?.email,
          phone: dayPassInfo?.phone,
          validDate: dayPassInfo?.validDate,
          amount: dayPassInfo?.amount,
          status: 'used',
        } as any);
      }
    });
  }

  async getCheckInById(id: string): Promise<CheckInResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid check-in ID');
    }

    const checkIn = await this.checkInModel
      .findById(id)
      .populate('memberId')
      .exec();

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    if (checkIn.memberId) {
      const checkInWithMember = checkIn as unknown as CheckInWithMember;
      return this.formatCheckInResponse(
        checkInWithMember,
        checkInWithMember.memberId,
      );
    } else {
      const dayPassInfo = checkIn.dayPassInfo;
      return this.formatDayPassCheckInResponse(checkIn, {
        passId: dayPassInfo?.passId,
        firstName: dayPassInfo?.firstName,
        lastName: dayPassInfo?.lastName,
        email: dayPassInfo?.email,
        phone: dayPassInfo?.phone,
        validDate: dayPassInfo?.validDate,
        amount: dayPassInfo?.amount,
        status: 'used',
      } as any);
    }
  }

  private formatCheckInResponse(
    checkIn: CheckInDocument | CheckInWithMember,
    member: MemberDocument,
  ): CheckInResponseDto {
    return {
      id: checkIn._id.toString(),
      memberId: member.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      checkInTime: checkIn.checkInTime,
      checkOutTime: checkIn.checkOutTime,
      duration: checkIn.duration,
      checkInMethod: checkIn.checkInMethod,
      status: checkIn.checkOutTime ? 'completed' : 'active',
      type: 'member',
    };
  }

  private formatDayPassCheckInResponse(
    checkIn: CheckInDocument,
    dayPass: any,
  ): CheckInResponseDto {
    return {
      id: checkIn._id.toString(),
      memberId: dayPass?.passId,
      memberName: `${dayPass?.firstName} ${dayPass?.lastName}`,
      checkInTime: checkIn.checkInTime,
      checkOutTime: checkIn.checkOutTime,
      duration: checkIn.duration,
      checkInMethod: checkIn.checkInMethod,
      status: checkIn.checkOutTime ? 'completed' : 'active',
      type: 'day-pass',
      dayPassInfo: {
        passId: dayPass?.passId,
        validDate: dayPass?.validDate,
        amount: dayPass?.amount,
      },
    };
  }
}
