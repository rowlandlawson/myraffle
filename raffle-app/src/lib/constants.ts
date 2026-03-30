// Raffle Points Conversion: ₦10 = 1 Raffle Point
export const NAIRA_PER_POINT = 10;
export const CONVERSION_RATE = NAIRA_PER_POINT;
export const POINTS_PER_NAIRA = 1 / NAIRA_PER_POINT;

/** Convert a naira amount to raffle points */
export function convertNairaToPoints(naira: number): number {
  return Math.floor(naira / NAIRA_PER_POINT);
}

/** Convert raffle points to naira equivalent */
export function convertPointsToNaira(points: number): number {
  return points * NAIRA_PER_POINT;
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
