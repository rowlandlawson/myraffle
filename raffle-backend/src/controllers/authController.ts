import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import {
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,
    generateResetToken,
    verifyRefreshToken,
} from '../services/jwt';
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
} from '../services/brevo';

// Generate unique user number: RAF-XXXXXX
const generateUserNumber = (): string => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RAF-${randomNum}`;
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, referralCode } = req.body;

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

        // Generate unique user number
        let userNumber = generateUserNumber();
        let numberExists = await prisma.user.findUnique({ where: { userNumber } });
        while (numberExists) {
            userNumber = generateUserNumber();
            numberExists = await prisma.user.findUnique({ where: { userNumber } });
        }

        // Generate email verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
                verificationToken,
                verificationTokenExpiry,
            },
        });

        // Send verification email
        await sendVerificationEmail(email, name, verificationToken);

        res.status(201).json({
            success: true,
            message:
                'Account created! Please check your email to verify your account before logging in.',
            data: {
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

// POST /api/auth/verify-email
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

        // Mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });

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
            }
        }

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);

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

// POST /api/auth/resend-verification
export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal whether the email exists
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

        // Check if email is verified
        if (!user.emailVerified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                needsVerification: true,
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

        // Generate tokens
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

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Check if the token matches the one stored in the database
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

        // Generate new tokens
        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = generateRefreshToken(user.id, user.role);

        // Update refresh token in database
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

        // Always return success to prevent email enumeration
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If that email is registered, a password reset link has been sent.',
            });
            return;
        }

        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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
