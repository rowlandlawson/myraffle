// Raffle Currency Conversion: System is 1:1 Naira (₦)
export const NAIRA_PER_POINT = 1;
export const CONVERSION_RATE = 1;
export const POINTS_PER_NAIRA = 1;

/** Convert a naira amount to raffle currency (1:1) */
export function convertNairaToPoints(naira: number): number {
  return naira || 0;
}

/** Convert raffle currency to naira equivalent (1:1) */
export function convertPointsToNaira(points: number): number {
  return points || 0;
}

/** Feature flag: cash payments are scaffolded but not yet active */
export const CASH_PAYMENT_ENABLED = false;

export const RAFFLE_STATUSES = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const TICKET_STATUSES = {
  ACTIVE: 'ACTIVE',
  WON: 'WON',
  LOST: 'LOST',
};

export const TASK_TYPES = {
  WATCH_AD: 'WATCH_AD',
  REFERRAL: 'REFERRAL',
  SOCIAL_SHARE: 'SOCIAL_SHARE',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  DAILY_LOGIN: 'DAILY_LOGIN',
  INVITE_FRIEND: 'INVITE_FRIEND',
};
