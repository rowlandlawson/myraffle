import rateLimit from 'express-rate-limit';

/**
 * Auth limiter: 10 requests per 15 minutes for register/login
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
  },
});

/**
 * OTP limiter: 3 requests per minute for verify/resend OTP
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a minute before trying again.',
  },
});

/**
 * General API limiter: 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

/**
 * Ticket Purchase Limiter: Max 5 purchase requests per 10 seconds per IP
 * Protects server against concurrent spam & high-concurrency buy clicks
 */
export const ticketPurchaseLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High purchase activity detected. Please wait a few seconds before trying again.',
  },
});
