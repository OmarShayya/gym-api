import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { SearchMembersDto } from '../../presentation/dto/search-members.dto';
import {
  IMemberSearchResult,
  IMemberFilters,
} from '../../domain/interfaces/member.interface';

@Injectable()
export class SearchMembersUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(dto: SearchMembersDto): Promise<IMemberSearchResult> {
    const filters: IMemberFilters = {
      status: dto.status,
      membershipType: dto.membershipType,
      search: dto.search,
    };

    if (dto.startDate && dto.endDate) {
      filters.startDate = new Date(dto.startDate);
      filters.endDate = new Date(dto.endDate);
    }

    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    return this.memberRepository.search(filters, page, limit);
  }

  async getAll(): Promise<IMemberSearchResult> {
    const members = await this.memberRepository.findAll();

    return {
      members: members.map((m) => ({
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
      total: members.length,
      page: 1,
      limit: members.length,
      hasMore: false,
    };
  }
}
