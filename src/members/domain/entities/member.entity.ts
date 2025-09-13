import { MemberStatus, MembershipType } from '../enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';
import { IEmergencyContact, IAddress } from '../interfaces/member.interface';

export class MemberEntity {
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

  constructor(partial: Partial<MemberEntity>) {
    Object.assign(this, partial);
    this.totalCheckIns = this.totalCheckIns || 0;
    this.membershipType = this.membershipType || MembershipType.BASIC;
    this.status = this.status || MemberStatus.ACTIVE;
    this.role = this.role || UserRole.MEMBER;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === MemberStatus.ACTIVE;
  }

  get isSuspended(): boolean {
    return this.status === MemberStatus.SUSPENDED;
  }

  get isMembershipValid(): boolean {
    const now = new Date();
    return this.membershipEndDate >= now && this.membershipStartDate <= now;
  }

  get isMembershipExpired(): boolean {
    return this.membershipEndDate < new Date();
  }

  get daysUntilExpiry(): number {
    const now = new Date();
    const diffTime = this.membershipEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isExpiringWithin(days: number): boolean {
    return this.daysUntilExpiry > 0 && this.daysUntilExpiry <= days;
  }

  canCheckIn(): boolean {
    return this.isActive && this.isMembershipValid;
  }

  recordCheckIn(): void {
    this.lastCheckIn = new Date();
    this.totalCheckIns += 1;
  }

  recordLogin(): void {
    this.lastLogin = new Date();
  }

  extendMembership(days: number): void {
    const currentEndDate = new Date(this.membershipEndDate);
    currentEndDate.setDate(currentEndDate.getDate() + days);
    this.membershipEndDate = currentEndDate;
  }

  suspend(reason?: string): void {
    this.status = MemberStatus.SUSPENDED;
  }

  activate(): void {
    this.status = MemberStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = MemberStatus.INACTIVE;
  }

  upgradeMembership(newType: MembershipType): void {
    this.membershipType = newType;
  }
}
