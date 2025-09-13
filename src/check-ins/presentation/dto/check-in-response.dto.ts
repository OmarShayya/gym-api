import {
  CheckInMethod,
  CheckInStatus,
  CheckInType,
} from '../../domain/enums/check-in.enum';

export class DayPassInfoDto {
  passId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  validDate: Date;
  amount: number;
}

export class MemberInfoDto {
  memberId: string;
  memberName: string;
  membershipType: string;
  membershipEndDate: Date;
}

export class CheckInResponseDto {
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
  dayPassInfo?: DayPassInfoDto;
  memberInfo?: MemberInfoDto;
}

export class CheckInListResponseDto {
  checkIns: CheckInResponseDto[];
  total: number;
}

export class CheckInStatisticsDto {
  totalToday: number;
  currentlyActive: number;
  averageDuration: number;
  peakHour: string;
  checkInsByMethod: Record<string, number>;
  checkInsByType: Record<string, number>;
}
