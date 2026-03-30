import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import {
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,
    generateResetToken,
    generateOTPCode,
    verifyRefreshToken,
    generateTempToken,
    verifyTempToken,
} from '../services/jwt';
import {
    sendVerificationEmail,
    sendEmailOTP,
    sendWelcomeEmail,
    sendPasswordResetEmail,
} from '../services/brevo';
import { sendWhatsAppOTP, sendSMSOTP } from '../services/infobip';
import { logTransaction } from '../utils/transactions';
import {
    generateSecret,
    generateQRCodeURL,
    verifyTOTPToken,
    generateAndSend2FAEmailOTP,
} from '../services/twoFactor';

// Generate unique User Number: RAF-XXXXXX
const generateUserNumber = (): string => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RAF-${randomNum}`;
};

// OTP expiry: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, referralCode } = req.body;

        if (!phone) {
            res.status(400).json({
                success: false,
                message: 'WhatsApp number is required.',
            });
            return;
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
            });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique User Number
        let userNumber = generateUserNumber();
        let numberExists = await prisma.user.findUnique({ where: { userNumber } });
        while (numberExists) {
            userNumber = generateUserNumber();
            numberExists = await prisma.user.findUnique({ where: { userNumber } });
        }

        // Generate OTP codes for both channels
        const emailCode = generateOTPCode();
        const whatsappCode = generateOTPCode();
        const codeExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

        // Handle referral
        let referredBy: string | null = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { userNumber: referralCode },
            });
            if (referrer) {
                referredBy = referrer.userNumber;
            }
        }

        // Create user (unverified)
        const user = await prisma.user.create({
            data: {
                userNumber,
                email,
                password: hashedPassword,
                name,
                phone: phone || null,
                referredBy,
                emailVerified: false,
                whatsappVerified: false,
                emailVerificationCode: emailCode,
                emailCodeExpiry: codeExpiry,
                whatsappVerificationCode: whatsappCode,
                whatsappCodeExpiry: codeExpiry,
            },
        });

        // Send OTPs via both channels
        await Promise.all([
            sendEmailOTP(email, name, emailCode),
            sendWhatsAppOTP(phone, whatsappCode),
        ]);

        res.status(201).json({
            success: true,
            message:
                'Account created! Please verify your email and WhatsApp number.',
            data: {
                userId: user.id,
                userNumber: user.userNumber,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('[Auth] Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create account. Please try again.',
        });
    }
};

// POST /api/auth/verify-email-otp
export const verifyEmailOTP = async (req: Request, res: Response) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            res.status(400).json({
                success: false,
                message: 'User ID and verification code are required.',
            });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        if (user.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified.',
                alreadyVerified: true,
            });
            return;
        }

        if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
            res.status(400).json({
                success: false,
                message: 'Invalid verification code.',
            });
            return;
        }

        if (user.emailCodeExpiry && user.emailCodeExpiry < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.',
            });
            return;
        }

        // Mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationCode: null,
                emailCodeExpiry: null,
            },
        });

        // Check if both channels are now verified
        const bothVerified = user.whatsappVerified; // email is now true
        if (bothVerified) {
            await handleFullVerification(user);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            data: { bothVerified },
        });
    } catch (error) {
        console.error('[Auth] Verify email OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email.',
        });
    }
};

// POST /api/auth/verify-whatsapp-otp
export const verifyWhatsAppOTP = async (req: Request, res: Response) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            res.status(400).json({
                success: false,
                message: 'User ID and verification code are required.',
            });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        if (user.whatsappVerified) {
            res.status(400).json({
                success: false,
                message: 'Phone is already verified.',
                alreadyVerified: true,
            });
            return;
        }

        if (!user.whatsappVerificationCode || user.whatsappVerificationCode !== code) {
            res.status(400).json({
                success: false,
                message: 'Invalid verification code.',
            });
            return;
        }

        if (user.whatsappCodeExpiry && user.whatsappCodeExpiry < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.',
            });
            return;
        }

        // Mark WhatsApp as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                whatsappVerified: true,
                whatsappVerificationCode: null,
                whatsappCodeExpiry: null,
            },
        });

        // Check if both channels are now verified
        const bothVerified = user.emailVerified; // whatsapp is now true
        if (bothVerified) {
            await handleFullVerification(user);
        }

        res.status(200).json({
            success: true,
            message: 'Phone verified successfully!',
            data: { bothVerified },
        });
    } catch (error) {
        console.error('[Auth] Verify WhatsApp OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify WhatsApp.',
        });
    }
};

// POST /api/auth/resend-email-otp
export const resendEmailOTP = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If the account exists, a new code has been sent.',
            });
            return;
        }

        if (user.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified.',
            });
            return;
        }

        const emailCode = generateOTPCode();
        const codeExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerificationCode: emailCode, emailCodeExpiry: codeExpiry },
        });

        await sendEmailOTP(user.email, user.name, emailCode);

        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent to your email.',
        });
    } catch (error) {
        console.error('[Auth] Resend email OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code.',
        });
    }
};

// POST /api/auth/resend-whatsapp-otp
export const resendWhatsAppOTP = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If the account exists, a new code has been sent.',
            });
            return;
        }

        if (user.whatsappVerified) {
            res.status(400).json({
                success: false,
                message: 'Phone is already verified.',
            });
            return;
        }

        if (!user.phone) {
            res.status(400).json({
                success: false,
                message: 'No WhatsApp number on file.',
            });
            return;
        }

        const whatsappCode = generateOTPCode();
        const codeExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

        await prisma.user.update({
            where: { id: user.id },
            data: { whatsappVerificationCode: whatsappCode, whatsappCodeExpiry: codeExpiry },
        });

        await sendWhatsAppOTP(user.phone, whatsappCode);

        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent to your phone (WhatsApp/SMS).',
        });
    } catch (error) {
        console.error('[Auth] Resend WhatsApp OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code.',
        });
    }
};

// POST /api/auth/resend-sms-otp
export const resendSMSOTP = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If the account exists, a new code has been sent.',
            });
            return;
        }

        if (user.whatsappVerified) {
            res.status(400).json({
                success: false,
                message: 'Phone is already verified.',
            });
            return;
        }

        if (!user.phone) {
            res.status(400).json({
                success: false,
                message: 'No phone number on file.',
            });
            return;
        }

        const smsCode = generateOTPCode();
        const codeExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

        await prisma.user.update({
            where: { id: user.id },
            data: { whatsappVerificationCode: smsCode, whatsappCodeExpiry: codeExpiry },
        });

        await sendSMSOTP(user.phone, smsCode);

        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent via SMS.',
        });
    } catch (error) {
        console.error('[Auth] Resend SMS OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code.',
        });
    }
};

// Helper: handle actions after both channels are verified
async function handleFullVerification(user: any) {
    // Award referral bonus if applicable
    if (user.referredBy) {
        const referrer = await prisma.user.findUnique({
            where: { userNumber: user.referredBy },
        });
        if (referrer) {
            await prisma.user.update({
                where: { id: referrer.id },
                data: { rafflePoints: { increment: 500 } },
            });

            await logTransaction({
                userId: referrer.id,
                type: 'TASK_REWARD',
                amount: 500,
                status: 'COMPLETED',
                description: `Referral bonus: ${user.name} (${user.userNumber}) completed verification.`,
            });
        }
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);
}

// Legacy: POST /api/auth/verify-email (keep for backward compatibility)
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Verification token is required.',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { verificationToken: token },
        });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid verification token.',
            });
            return;
        }

        if (user.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified.',
            });
            return;
        }

        if (
            user.verificationTokenExpiry &&
            user.verificationTokenExpiry < new Date()
        ) {
            res.status(400).json({
                success: false,
                message: 'Verification token has expired. Please request a new one.',
            });
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });

        if (user.whatsappVerified) {
            await handleFullVerification(user);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
        });
    } catch (error) {
        console.error('[Auth] Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email. Please try again.',
        });
    }
};

// POST /api/auth/resend-verification (legacy)
export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If that email is registered, a verification link has been sent.',
            });
            return;
        }

        if (user.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'This email is already verified.',
            });
            return;
        }

        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken, verificationTokenExpiry },
        });

        await sendVerificationEmail(user.email, user.name, verificationToken);

        res.status(200).json({
            success: true,
            message: 'If that email is registered, a verification link has been sent.',
        });
    } catch (error) {
        console.error('[Auth] Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification email.',
        });
    }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }

        // Check if both email and WhatsApp are verified
        if (!user.emailVerified || !user.whatsappVerified) {
            res.status(403).json({
                success: false,
                message: 'Please complete verification (email & WhatsApp) before logging in.',
                needsVerification: true,
                userId: user.id,
                emailVerified: user.emailVerified,
                whatsappVerified: user.whatsappVerified,
            });
            return;
        }

        // Check if account is suspended
        if (user.status === 'SUSPENDED') {
            res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.',
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled && user.twoFactorMethod) {
            // Generate a short-lived temp token for the 2FA verification step
            const tempToken = generateTempToken(user.id, user.twoFactorMethod);

            // For EMAIL method, send an OTP now
            if (user.twoFactorMethod === 'EMAIL') {
                const { code, expiry } = await generateAndSend2FAEmailOTP(user.email, user.name);
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailVerificationCode: code,
                        emailCodeExpiry: expiry,
                    },
                });
            }

            res.status(200).json({
                success: true,
                message: 'Two-factor authentication required.',
                data: {
                    requires2FA: true,
                    tempToken,
                    method: user.twoFactorMethod,
                },
            });
            return;
        }

        // No 2FA — generate tokens directly
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        // Store refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    userNumber: user.userNumber,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    walletBalance: user.walletBalance,
                    rafflePoints: user.rafflePoints,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
        });
    }
};

// POST /api/auth/refresh-token
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required.',
            });
            return;
        }

        const decoded = verifyRefreshToken(refreshToken);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.',
            });
            return;
        }

        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = generateRefreshToken(user.id, user.role);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token.',
        });
    }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response) => {
    try {
        if (req.user) {
            await prisma.user.update({
                where: { id: req.user.userId },
                data: { refreshToken: null },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        console.error('[Auth] Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed.',
        });
    }
};

// GET /api/auth/me
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                userNumber: true,
                email: true,
                name: true,
                phone: true,
                walletBalance: true,
                rafflePoints: true,
                role: true,
                status: true,
                emailVerified: true,
                whatsappVerified: true,
                twoFactorEnabled: true,
                twoFactorMethod: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found.',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        console.error('[Auth] Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data.',
        });
    }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If that email is registered, a password reset link has been sent.',
            });
            return;
        }

        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordTokenExpiry: resetTokenExpiry,
            },
        });

        await sendPasswordResetEmail(user.email, user.name, resetToken);

        res.status(200).json({
            success: true,
            message: 'If that email is registered, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('[Auth] Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request.',
        });
    }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { resetPasswordToken: token },
        });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.',
            });
            return;
        }

        if (
            user.resetPasswordTokenExpiry &&
            user.resetPasswordTokenExpiry < new Date()
        ) {
            res.status(400).json({
                success: false,
                message: 'Reset token has expired. Please request a new one.',
            });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpiry: null,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
        });
    } catch (error) {
        console.error('[Auth] Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password.',
        });
    }
};

// ─── 2FA ENDPOINTS ────────────────────────────────────────

// POST /api/auth/2fa/setup
export const setup2FA = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { method } = req.body; // 'EMAIL' or 'TOTP'

        if (!method || !['EMAIL', 'TOTP'].includes(method)) {
            res.status(400).json({ success: false, message: 'Invalid 2FA method. Use EMAIL or TOTP.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        if (method === 'TOTP') {
            const secret = generateSecret();
            const qrCodeDataUrl = await generateQRCodeURL(secret, user.email);

            await prisma.user.update({
                where: { id: userId },
                data: { twoFactorSecret: secret, twoFactorMethod: 'TOTP' },
            });

            res.status(200).json({
                success: true,
                message: 'Scan the QR code with your authenticator app, then enter the code to confirm.',
                data: { method: 'TOTP', qrCode: qrCodeDataUrl, secret },
            });
        } else {
            const { code, expiry } = await generateAndSend2FAEmailOTP(user.email, user.name);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorMethod: 'EMAIL',
                    emailVerificationCode: code,
                    emailCodeExpiry: expiry,
                },
            });

            res.status(200).json({
                success: true,
                message: 'A verification code has been sent to your email.',
                data: { method: 'EMAIL' },
            });
        }
    } catch (error) {
        console.error('[Auth] 2FA setup error:', error);
        res.status(500).json({ success: false, message: 'Failed to setup 2FA.' });
    }
};

// POST /api/auth/2fa/confirm
export const confirm2FA = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { code } = req.body;

        if (!code) {
            res.status(400).json({ success: false, message: 'Verification code is required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorMethod) {
            res.status(400).json({ success: false, message: 'Please run 2FA setup first.' });
            return;
        }

        let isValid = false;

        if (user.twoFactorMethod === 'TOTP') {
            if (!user.twoFactorSecret) {
                res.status(400).json({ success: false, message: 'TOTP secret not found.' });
                return;
            }
            isValid = verifyTOTPToken(code, user.twoFactorSecret);
        } else {
            if (!user.emailVerificationCode || !user.emailCodeExpiry) {
                res.status(400).json({ success: false, message: 'No OTP code found.' });
                return;
            }
            if (new Date() > user.emailCodeExpiry) {
                res.status(400).json({ success: false, message: 'Code expired. Please run setup again.' });
                return;
            }
            isValid = user.emailVerificationCode === code;
        }

        if (!isValid) {
            res.status(400).json({ success: false, message: 'Invalid verification code.' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                emailVerificationCode: null,
                emailCodeExpiry: null,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Two-factor authentication has been enabled!',
        });
    } catch (error) {
        console.error('[Auth] 2FA confirm error:', error);
        res.status(500).json({ success: false, message: 'Failed to confirm 2FA.' });
    }
};

// POST /api/auth/2fa/verify — during login
export const verify2FA = async (req: Request, res: Response) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) {
            res.status(400).json({ success: false, message: 'Token and code are required.' });
            return;
        }

        let decoded;
        try {
            decoded = verifyTempToken(tempToken);
        } catch {
            res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.twoFactorEnabled) {
            res.status(400).json({ success: false, message: 'Invalid account.' });
            return;
        }

        let isValid = false;

        if (user.twoFactorMethod === 'TOTP') {
            if (!user.twoFactorSecret) {
                res.status(400).json({ success: false, message: 'TOTP not configured.' });
                return;
            }
            isValid = verifyTOTPToken(code, user.twoFactorSecret);
        } else if (user.twoFactorMethod === 'EMAIL') {
            if (!user.emailVerificationCode || !user.emailCodeExpiry) {
                res.status(400).json({ success: false, message: 'No OTP code found.' });
                return;
            }
            if (new Date() > user.emailCodeExpiry) {
                res.status(400).json({ success: false, message: 'Code expired.' });
                return;
            }
            isValid = user.emailVerificationCode === code;
        }

        if (!isValid) {
            res.status(400).json({ success: false, message: 'Invalid verification code.' });
            return;
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken,
                emailVerificationCode: null,
                emailCodeExpiry: null,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    userNumber: user.userNumber,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    walletBalance: user.walletBalance,
                    rafflePoints: user.rafflePoints,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('[Auth] 2FA verify error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify 2FA.' });
    }
};

// POST /api/auth/2fa/resend
export const resend2FACode = async (req: Request, res: Response) => {
    try {
        const { tempToken } = req.body;

        if (!tempToken) {
            res.status(400).json({ success: false, message: 'Token is required.' });
            return;
        }

        let decoded;
        try {
            decoded = verifyTempToken(tempToken);
        } catch {
            res.status(401).json({ success: false, message: 'Session expired.' });
            return;
        }

        if (decoded.method !== 'EMAIL') {
            res.status(400).json({ success: false, message: 'Resend only for email 2FA.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const { code, expiry } = await generateAndSend2FAEmailOTP(user.email, user.name);
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerificationCode: code, emailCodeExpiry: expiry },
        });

        res.status(200).json({
            success: true,
            message: 'New code sent to your email.',
        });
    } catch (error) {
        console.error('[Auth] 2FA resend error:', error);
        res.status(500).json({ success: false, message: 'Failed to resend code.' });
    }
};

// DELETE /api/auth/2fa/disable
export const disable2FA = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { password } = req.body;

        if (!password) {
            res.status(400).json({ success: false, message: 'Password is required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'Incorrect password.' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorMethod: null,
                twoFactorSecret: null,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Two-factor authentication has been disabled.',
        });
    } catch (error) {
        console.error('[Auth] 2FA disable error:', error);
        res.status(500).json({ success: false, message: 'Failed to disable 2FA.' });
    }
};
