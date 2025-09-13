import { MemberDocument } from '../../infrastructure/schemas/member.schema';
import {
  IMemberFilters,
  IMemberSearchResult,
} from '../interfaces/member.interface';
import { MemberStatus } from '../enums/member-status.enum';

export interface IMemberRepository {
  create(data: any): Promise<MemberDocument>;
  findById(id: string): Promise<MemberDocument | null>;
  findByEmail(email: string): Promise<MemberDocument | null>;
  findByMemberId(memberId: string): Promise<MemberDocument | null>;
  findAll(): Promise<MemberDocument[]>;
  search(
    filters: IMemberFilters,
    page: number,
    limit: number,
  ): Promise<IMemberSearchResult>;
  update(id: string, data: any): Promise<MemberDocument | null>;
  updateStatus(
    id: string,
    status: MemberStatus,
  ): Promise<MemberDocument | null>;
  updateLastLogin(id: string): Promise<MemberDocument | null>;
  updateLastCheckIn(id: string): Promise<MemberDocument | null>;
  delete(id: string): Promise<boolean>;
  countByStatus(status?: MemberStatus): Promise<number>;
  findExpiringMemberships(days: number): Promise<MemberDocument[]>;
}
