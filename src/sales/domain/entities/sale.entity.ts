import { PaymentMethod, SaleStatus, SALES_CONSTANTS } from '../enums/sale.enum';
import {
  ISaleItem,
  IDiscount,
  IRefundInfo,
} from '../interfaces/sale.interface';

export class SaleEntity {
  id: string;
  saleNumber: string;
  memberId: string;
  memberName?: string;
  items: ISaleItem[];
  subtotal: number;
  discount?: IDiscount;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  refundInfo?: IRefundInfo;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<SaleEntity>) {
    Object.assign(this, partial);
    this.status = this.status || SaleStatus.PENDING;
    this.items = this.items || [];
    this.calculateTotals();
  }

  get isCompleted(): boolean {
    return this.status === SaleStatus.COMPLETED;
  }

  get isCancelled(): boolean {
    return this.status === SaleStatus.CANCELLED;
  }

  get isRefunded(): boolean {
    return (
      this.status === SaleStatus.REFUNDED ||
      this.status === SaleStatus.PARTIAL_REFUND
    );
  }

  get canBeRefunded(): boolean {
    if (!this.isCompleted) return false;
    if (this.status === SaleStatus.REFUNDED) return false;

    const refundWindow = new Date();
    refundWindow.setDate(
      refundWindow.getDate() - SALES_CONSTANTS.REFUND_WINDOW_DAYS,
    );
    return this.createdAt > refundWindow;
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    let discountAmount = 0;
    if (this.discount) {
      if (this.discount.type === 'percentage') {
        discountAmount = (this.subtotal * this.discount.value) / 100;
      } else {
        discountAmount = this.discount.value;
      }
      this.discount.amount = discountAmount;
    }

    const afterDiscount = this.subtotal - discountAmount;
    this.tax = afterDiscount * SALES_CONSTANTS.DEFAULT_TAX_RATE;
    this.total = afterDiscount + this.tax;
  }

  complete(): void {
    if (this.status !== SaleStatus.PENDING) {
      throw new Error('Only pending sales can be completed');
    }
    this.status = SaleStatus.COMPLETED;
  }

  cancel(): void {
    if (this.isCompleted || this.isRefunded) {
      throw new Error('Cannot cancel completed or refunded sales');
    }
    this.status = SaleStatus.CANCELLED;
  }

  generateSaleNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${SALES_CONSTANTS.SALE_NUMBER_PREFIX}${timestamp}${random}`;
  }
}
