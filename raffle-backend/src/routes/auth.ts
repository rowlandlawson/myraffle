import { Router } from 'express';
import {
    register,
    verifyEmail,
    verifyEmailOTP,
    verifyWhatsAppOTP,
    resendVerification,
    resendEmailOTP,
    resendWhatsAppOTP,
    resendSMSOTP,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    setup2FA,
    confirm2FA,
    verify2FA,
    resend2FACode,
    disable2FA,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import {
    validate,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyOTPSchema,
    resendOTPSchema,
} from '../middleware/validation';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/verify-email', otpLimiter, verifyEmail); // Legacy link-based
router.post('/verify-email-otp', otpLimiter, validate(verifyOTPSchema), verifyEmailOTP);
router.post('/verify-whatsapp-otp', otpLimiter, validate(verifyOTPSchema), verifyWhatsAppOTP);
router.post('/resend-verification', otpLimiter, resendVerification); // Legacy
router.post('/resend-email-otp', otpLimiter, validate(resendOTPSchema), resendEmailOTP);
router.post('/resend-whatsapp-otp', otpLimiter, validate(resendOTPSchema), resendWhatsAppOTP);
router.post('/resend-sms-otp', otpLimiter, validate(resendOTPSchema), resendSMSOTP);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// 2FA routes (public — use tempToken for auth)
router.post('/2fa/verify', otpLimiter, verify2FA);
router.post('/2fa/resend', otpLimiter, resend2FACode);

// Protected routes
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getCurrentUser);

// 2FA management (authenticated)
router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/confirm', requireAuth, confirm2FA);
router.post('/2fa/disable', requireAuth, disable2FA);

export default router;
