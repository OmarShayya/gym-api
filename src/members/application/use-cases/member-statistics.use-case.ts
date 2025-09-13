import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { IMemberStatistics } from '../../domain/interfaces/member.interface';
import { MemberStatus } from '../../domain/enums/member-status.enum';

@Injectable()
export class MemberStatisticsUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(): Promise<IMemberStatistics> {
    const [total, active, inactive, suspended, expiringMembers] =
      await Promise.all([
        this.memberRepository.countByStatus(),
        this.memberRepository.countByStatus(MemberStatus.ACTIVE),
        this.memberRepository.countByStatus(MemberStatus.INACTIVE),
        this.memberRepository.countByStatus(MemberStatus.SUSPENDED),
        this.memberRepository.findExpiringMemberships(30),
      ]);

    return {
      total,
      active,
      inactive,
      suspended,
      expiring: expiringMembers.length,
      expiringMembers: expiringMembers.map((m) => ({
        id: m._id.toString(),
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        memberId: m.memberId,
        qrCode: m.qrCode,
        fingerprintId: m.fingerprintId,
        membershipStartDate: m.membershipStartDate,
        membershipEndDate: m.membershipEndDate,
        membershipType: m.membershipType as any,
        status: m.status as any,
        role: m.role as any,
        lastCheckIn: m.lastCheckIn,
        lastLogin: m.lastLogin,
        totalCheckIns: m.totalCheckIns || 0,
        profilePicture: m.profilePicture,
        emergencyContact: m.emergencyContact,
        address: m.address,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    };
  }
}
