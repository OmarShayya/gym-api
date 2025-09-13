export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  ONLINE = 'online',
  STORE_CREDIT = 'store_credit',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  MEMBER = 'member',
  PROMOTIONAL = 'promotional',
}

export enum RefundReason {
  DEFECTIVE = 'defective',
  NOT_SATISFIED = 'not_satisfied',
  WRONG_ITEM = 'wrong_item',
  DUPLICATE = 'duplicate',
  OTHER = 'other',
}

export const SALES_CONSTANTS = {
  MAX_ITEMS_PER_SALE: 50,
  MAX_DISCOUNT_PERCENTAGE: 100,
  DEFAULT_TAX_RATE: 0.1, // 10%
  MEMBER_DISCOUNT_PERCENTAGE: 10,
  SALE_NUMBER_PREFIX: 'SALE',
  REFUND_WINDOW_DAYS: 30,
};
