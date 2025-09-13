import {
  CheckInMethod,
  CheckInStatus,
  CheckInType,
} from '../enums/check-in.enum';

export interface ICheckIn {
  id: string;
  memberId?: string;
  dayPassId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number;
  method: CheckInMethod;
  status: CheckInStatus;
  type: CheckInType;
  autoCheckout: boolean;
  scheduledCheckoutTime?: Date;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDayPassInfo {
  passId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  validDate: Date;
  amount: number;
}

export interface ICheckInMemberInfo {
  memberId: string;
  memberName: string;
  membershipType: string;
  membershipEndDate: Date;
}

export interface ICheckInResponse {
  id: string;
  memberId?: string;
  memberName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number;
  method: CheckInMethod;
  status: CheckInStatus;
  type: CheckInType;
  scheduledCheckoutTime?: Date;
  dayPassInfo?: IDayPassInfo;
  memberInfo?: ICheckInMemberInfo;
}

export interface ICheckInStatistics {
  totalToday: number;
  currentlyActive: number;
  averageDuration: number;
  peakHour: string;
  checkInsByMethod: Record<CheckInMethod, number>;
  checkInsByType: Record<CheckInType, number>;
}

export interface ICheckInValidation {
  isValid: boolean;
  canCheckIn: boolean;
  reason?: string;
  validUntil?: Date;
  remainingCheckIns?: number;
}

export interface ICreateCheckInData {
  memberId?: string;
  dayPassId?: string;
  method: CheckInMethod;
  type: CheckInType;
  location?: string;
  notes?: string;
  autoCheckout?: boolean;
  dayPassInfo?: IDayPassInfo;
}

export interface ICheckInFilters {
  memberId?: string;
  status?: CheckInStatus;
  type?: CheckInType;
  startDate?: Date;
  endDate?: Date;
  method?: CheckInMethod;
}
