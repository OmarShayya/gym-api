import {
  DayPassStatus,
  PaymentMethod,
  DayPassType,
  DAY_PASS_CONSTANTS,
} from '../enums/day-pass.enum';

export class DayPassEntity {
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

  constructor(partial: Partial<DayPassEntity>) {
    Object.assign(this, partial);
    this.status = this.status || DayPassStatus.ACTIVE;
    this.type = this.type || DayPassType.SINGLE;
    this.paymentMethod = this.paymentMethod || PaymentMethod.CASH;
    this.numberOfPeople = this.numberOfPeople || 1;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === DayPassStatus.ACTIVE;
  }

  get isUsed(): boolean {
    return this.status === DayPassStatus.USED;
  }

  get isExpired(): boolean {
    return this.status === DayPassStatus.EXPIRED;
  }

  get isCancelled(): boolean {
    return this.status === DayPassStatus.CANCELLED;
  }

  get isValidForToday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(this.validDate);
    validDate.setHours(0, 0, 0, 0);
    return validDate.getTime() === today.getTime();
  }

  get isValidForFuture(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(this.validDate);
    validDate.setHours(0, 0, 0, 0);
    return validDate > today;
  }

  get shouldExpire(): boolean {
    if (this.isExpired || this.isUsed || this.isCancelled) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(this.validDate);
    validDate.setHours(0, 0, 0, 0);
    return validDate < today;
  }

  canUse(): boolean {
    return this.isActive && this.isValidForToday;
  }

  use(): void {
    if (!this.canUse()) {
      throw new Error('Day pass cannot be used');
    }
    this.status = DayPassStatus.USED;
    this.usedAt = new Date();
  }

  expire(): void {
    if (this.isUsed || this.isCancelled) {
      throw new Error('Cannot expire a used or cancelled pass');
    }
    this.status = DayPassStatus.EXPIRED;
  }

  cancel(reason?: string): void {
    if (this.isUsed) {
      throw new Error('Cannot cancel a used pass');
    }
    this.status = DayPassStatus.CANCELLED;
    if (reason) {
      this.notes = `${this.notes || ''}\nCancelled: ${reason}`.trim();
    }
  }

  calculatePrice(): number {
    let basePrice = this.amount || DAY_PASS_CONSTANTS.DEFAULT_PRICE;

    if (this.type === DayPassType.FAMILY) {
      basePrice = basePrice * 2.5;
    } else if (this.type === DayPassType.COUPLE) {
      basePrice = basePrice * 1.8;
    } else if (this.type === DayPassType.GROUP && this.numberOfPeople > 5) {
      const discount =
        basePrice * (DAY_PASS_CONSTANTS.GROUP_DISCOUNT_PERCENTAGE / 100);
      basePrice = (basePrice - discount) * this.numberOfPeople;
    } else if (this.numberOfPeople > 1) {
      basePrice = basePrice * this.numberOfPeople;
    }

    return Math.round(basePrice * 100) / 100;
  }

  extendValidity(days: number): void {
    if (this.isUsed || this.isExpired || this.isCancelled) {
      throw new Error('Cannot extend validity of this pass');
    }
    const newDate = new Date(this.validDate);
    newDate.setDate(newDate.getDate() + days);
    this.validDate = newDate;
  }
}
