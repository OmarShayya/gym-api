export enum CheckInMethod {
  QR = 'qr',
  FINGERPRINT = 'fingerprint',
  MANUAL = 'manual',
  CARD = 'card',
}

export enum CheckInStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  AUTO_COMPLETED = 'auto_completed',
  EXPIRED = 'expired',
}

export enum CheckInType {
  MEMBER = 'member',
  DAY_PASS = 'day_pass',
  GUEST = 'guest',
}

export const CHECK_IN_CONSTANTS = {
  AUTO_CHECKOUT_HOURS: 3,
  MAX_DAILY_CHECKINS: 2,
  MIN_CHECKOUT_DURATION_MINUTES: 5,
};
