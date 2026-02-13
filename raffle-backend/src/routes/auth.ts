import { Router } from 'express';
import {
    register,
    verifyEmail,
    resendVerification,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import {
    validate,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;
