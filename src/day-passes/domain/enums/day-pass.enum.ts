export enum DayPassStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
  TRANSFER = 'transfer',
}

export enum DayPassType {
  SINGLE = 'single',
  COUPLE = 'couple',
  FAMILY = 'family',
  GROUP = 'group',
}

export const DAY_PASS_CONSTANTS = {
  DEFAULT_PRICE: 10,
  GROUP_DISCOUNT_PERCENTAGE: 10,
  ADVANCE_BOOKING_DAYS: 30,
  QR_CODE_PREFIX: 'DP',
};
