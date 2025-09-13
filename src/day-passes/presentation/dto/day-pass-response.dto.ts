import {
  DayPassStatus,
  PaymentMethod,
  DayPassType,
} from '../../domain/enums/day-pass.enum';

export class DayPassResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  passId: string;
  qrCode: string;
  validDate: Date;
  type: DayPassType;
  paymentMethod: PaymentMethod;
  amount: number;
  status: DayPassStatus;
  usedAt?: Date;
  numberOfPeople: number;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DayPassListResponseDto {
  passes: DayPassResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class DayPassStatisticsDto {
  totalToday: number;
  totalActive: number;
  totalUsed: number;
  totalExpired: number;
  totalRevenue: number;
  averagePrice: number;
  byType: Record<string, number>;
  byPaymentMethod: Record<string, number>;
}
