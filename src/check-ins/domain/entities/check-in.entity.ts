import {
  CheckInMethod,
  CheckInStatus,
  CheckInType,
  CHECK_IN_CONSTANTS,
} from '../enums/check-in.enum';
import { IDayPassInfo } from '../interfaces/check-in.interface';

export class CheckInEntity {
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
  dayPassInfo?: IDayPassInfo;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CheckInEntity>) {
    Object.assign(this, partial);
    this.status = this.status || CheckInStatus.ACTIVE;
    this.autoCheckout = this.autoCheckout !== false;

    if (this.checkInTime && this.autoCheckout && !this.scheduledCheckoutTime) {
      this.scheduledCheckoutTime = this.calculateScheduledCheckout();
    }
  }

  get isActive(): boolean {
    return this.status === CheckInStatus.ACTIVE;
  }

  get isCompleted(): boolean {
    return (
      this.status === CheckInStatus.COMPLETED ||
      this.status === CheckInStatus.AUTO_COMPLETED
    );
  }

  get durationInMinutes(): number {
    if (!this.checkOutTime) {
      const now = new Date();
      return Math.floor((now.getTime() - this.checkInTime.getTime()) / 60000);
    }
    return this.duration || 0;
  }

  get durationInHours(): number {
    return Math.floor(this.durationInMinutes / 60);
  }

  get shouldAutoCheckout(): boolean {
    if (!this.autoCheckout || this.isCompleted) {
      return false;
    }

    const now = new Date();
    return this.scheduledCheckoutTime
      ? now >= this.scheduledCheckoutTime
      : false;
  }

  calculateScheduledCheckout(): Date {
    const checkoutTime = new Date(this.checkInTime);
    checkoutTime.setHours(
      checkoutTime.getHours() + CHECK_IN_CONSTANTS.AUTO_CHECKOUT_HOURS,
    );
    return checkoutTime;
  }

  checkOut(checkOutTime: Date = new Date()): void {
    if (this.isCompleted) {
      throw new Error('Check-in is already completed');
    }

    this.checkOutTime = checkOutTime;
    this.duration = Math.floor(
      (checkOutTime.getTime() - this.checkInTime.getTime()) / 60000,
    );
    this.status = CheckInStatus.COMPLETED;
  }

  autoCheckOut(): void {
    if (this.isCompleted) {
      throw new Error('Check-in is already completed');
    }

    const checkOutTime = this.scheduledCheckoutTime || new Date();
    this.checkOutTime = checkOutTime;
    this.duration = Math.floor(
      (checkOutTime.getTime() - this.checkInTime.getTime()) / 60000,
    );
    this.status = CheckInStatus.AUTO_COMPLETED;
  }

  extend(additionalHours: number): void {
    if (this.isCompleted) {
      throw new Error('Cannot extend completed check-in');
    }

    if (this.scheduledCheckoutTime) {
      const newCheckoutTime = new Date(this.scheduledCheckoutTime);
      newCheckoutTime.setHours(newCheckoutTime.getHours() + additionalHours);
      this.scheduledCheckoutTime = newCheckoutTime;
    }
  }

  addNote(note: string): void {
    if (this.notes) {
      this.notes += `\n${note}`;
    } else {
      this.notes = note;
    }
  }

  isValidForCheckout(
    minDurationMinutes: number = CHECK_IN_CONSTANTS.MIN_CHECKOUT_DURATION_MINUTES,
  ): boolean {
    return this.durationInMinutes >= minDurationMinutes;
  }
}
