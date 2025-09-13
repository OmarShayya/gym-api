import { UserRole } from '../enums/user-role.enum';

export class AuthUserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  memberId: string;
  status: 'active' | 'inactive' | 'suspended';
  membershipStartDate: Date;
  membershipEndDate: Date;
  fingerprintId?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AuthUserEntity>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isMembershipValid(): boolean {
    const now = new Date();
    return this.membershipEndDate >= now && this.membershipStartDate <= now;
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.role);
  }
}
