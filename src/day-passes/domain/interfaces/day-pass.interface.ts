import {
  DayPassStatus,
  PaymentMethod,
  DayPassType,
} from '../enums/day-pass.enum';

export interface IDayPass {
  id: string;
  firstName: string;
  lastName: string;
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

export interface IDayPassStatistics {
  totalToday: number;
  totalActive: number;
  totalUsed: number;
  totalExpired: number;
  totalRevenue: number;
  averagePrice: number;
  byType: Record<DayPassType, number>;
  byPaymentMethod: Record<PaymentMethod, number>;
}

export interface IDayPassValidation {
  isValid: boolean;
  canUse: boolean;
  reason?: string;
  validUntil?: Date;
}

export interface ICreateDayPassData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  validDate: Date;
  type?: DayPassType;
  paymentMethod?: PaymentMethod;
  amount: number;
  numberOfPeople?: number;
  notes?: string;
  createdBy?: string;
}

export interface IUpdateDayPassData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  validDate?: Date;
  type?: DayPassType;
  amount?: number;
  numberOfPeople?: number;
  notes?: string;
}

export interface IDayPassSearchFilters {
  status?: DayPassStatus;
  type?: DayPassType;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface IDayPassSearchResult {
  passes: IDayPass[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
