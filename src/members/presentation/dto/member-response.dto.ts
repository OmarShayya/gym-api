import { MemberStatus, MembershipType } from '../../domain/enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

export class EmergencyContactResponseDto {
  name: string;
  phone: string;
  relationship: string;
}

export class AddressResponseDto {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export class MemberResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  memberId: string;
  qrCode: string;
  fingerprintId?: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  membershipType: MembershipType;
  status: MemberStatus;
  role: UserRole;
  lastCheckIn?: Date;
  lastLogin?: Date;
  totalCheckIns: number;
  profilePicture?: string;
  emergencyContact?: EmergencyContactResponseDto;
  address?: AddressResponseDto;
  daysUntilExpiry: number;
  isMembershipValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MemberListResponseDto {
  members: MemberResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class MemberStatisticsResponseDto {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  expiring: number;
  expiringMembers?: MemberResponseDto[];
}