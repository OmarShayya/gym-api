import { Injectable } from '@nestjs/common';
import { CheckInRepository } from '../../infrastructure/repositories/check-in.repository';
import { CheckInMapper } from '../../infrastructure/mappers/check-in.mapper';
import { MemberRepository } from '../../../members/infrastructure/repositories/member.repository';
import {
  ICheckInResponse,
  ICheckInFilters,
} from '../../domain/interfaces/check-in.interface';
import { CheckInStatus } from '../../domain/enums/check-in.enum';

@Injectable()
export class GetCheckInsUseCase {
  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly checkInMapper: CheckInMapper,
    private readonly memberRepository: MemberRepository,
  ) {}

  async getById(id: string): Promise<ICheckInResponse> {
    const checkIn = await this.checkInRepository.findById(id);
    if (!checkIn) {
      throw new Error('Check-in not found');
    }

    let memberName = 'Unknown';
    if (checkIn.memberId) {
      const member = await this.memberRepository.findById(
        checkIn.memberId.toString(),
      );
      if (member) {
        memberName = `${member.firstName} ${member.lastName}`;
      }
    } else if (checkIn.dayPassInfo) {
      memberName = `${checkIn.dayPassInfo.firstName} ${checkIn.dayPassInfo.lastName}`;
    }

    return this.checkInMapper.toResponseFromDocument(checkIn, memberName);
  }

  async getMemberCheckIns(
    memberId: string,
    limit?: number,
  ): Promise<ICheckInResponse[]> {
    const member = await this.memberRepository.findByMemberId(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const checkIns = await this.checkInRepository.findMemberCheckIns(
      member._id.toString(),
      limit,
    );

    const memberName = `${member.firstName} ${member.lastName}`;
    return checkIns.map((checkIn) =>
      this.checkInMapper.toResponseFromDocument(checkIn, memberName),
    );
  }

  async getActiveCheckIns(): Promise<ICheckInResponse[]> {
    const checkIns = await this.checkInRepository.findActiveCheckIns();

    return Promise.all(
      checkIns.map(async (checkIn) => {
        let memberName = 'Unknown';

        if (checkIn.memberId) {
          const member = await this.memberRepository.findById(
            checkIn.memberId.toString(),
          );
          if (member) {
            memberName = `${member.firstName} ${member.lastName}`;
          }
        } else if (checkIn.dayPassInfo) {
          memberName = `${checkIn.dayPassInfo.firstName} ${checkIn.dayPassInfo.lastName}`;
        }

        return this.checkInMapper.toResponseFromDocument(checkIn, memberName);
      }),
    );
  }

  async getTodayCheckIns(): Promise<ICheckInResponse[]> {
    const checkIns = await this.checkInRepository.findTodayCheckIns();

    return Promise.all(
      checkIns.map(async (checkIn) => {
        let memberName = 'Unknown';

        if (checkIn.memberId) {
          const member = await this.memberRepository.findById(
            checkIn.memberId.toString(),
          );
          if (member) {
            memberName = `${member.firstName} ${member.lastName}`;
          }
        } else if (checkIn.dayPassInfo) {
          memberName = `${checkIn.dayPassInfo.firstName} ${checkIn.dayPassInfo.lastName}`;
        }

        return this.checkInMapper.toResponseFromDocument(checkIn, memberName);
      }),
    );
  }

  async getByFilters(filters: ICheckInFilters): Promise<ICheckInResponse[]> {
    const checkIns = await this.checkInRepository.findByFilters(filters);

    return Promise.all(
      checkIns.map(async (checkIn) => {
        let memberName = 'Unknown';

        if (checkIn.memberId) {
          const member = await this.memberRepository.findById(
            checkIn.memberId.toString(),
          );
          if (member) {
            memberName = `${member.firstName} ${member.lastName}`;
          }
        } else if (checkIn.dayPassInfo) {
          memberName = `${checkIn.dayPassInfo.firstName} ${checkIn.dayPassInfo.lastName}`;
        }

        return this.checkInMapper.toResponseFromDocument(checkIn, memberName);
      }),
    );
  }
}
