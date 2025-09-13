import { Types } from 'mongoose';
import {
  MemberStatus,
  MembershipType,
  PaymentStatus,
} from '../enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

export interface IMember {
  id: string;
  firstName: string;
  lastName: string;
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
  emergencyContact?: IEmergencyContact;
  address?: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IMemberWithPassword extends IMember {
  password: string;
}

export interface IMemberStatistics {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  expiring: number;
  expiringMembers?: IMember[];
}

export interface IMemberSearchResult {
  members: IMember[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IMemberFilters {
  status?: MemberStatus;
  membershipType?: MembershipType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface ICreateMemberData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  membershipType?: MembershipType;
  fingerprintId?: string;
  role?: UserRole;
  status?: MemberStatus;
  profilePicture?: string;
  emergencyContact?: IEmergencyContact;
  address?: IAddress;
}

export interface IUpdateMemberData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  membershipType?: MembershipType;
  fingerprintId?: string;
  status?: MemberStatus;
  role?: UserRole;
  profilePicture?: string;
  emergencyContact?: IEmergencyContact;
  address?: IAddress;
}
