import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.issues.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};

// Auth Validation Schemas
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    phone: z.string().optional(),
    referralCode: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
});

// Wallet/Payment Validation Schemas
export const depositSchema = z.object({
    amount: z
        .number({ message: 'Amount must be a number' })
        .min(100, 'Minimum deposit is ₦100'),
});

export const withdrawalSchema = z.object({
    amount: z
        .number({ message: 'Amount must be a number' })
        .min(500, 'Minimum withdrawal is ₦500'),
    bankCode: z.string().min(1, 'Bank code is required'),
    accountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
    accountName: z.string().min(2, 'Account name is required'),
});

export const verifyPaymentSchema = z.object({
    reference: z.string().min(1, 'Payment reference is required'),
});

// Raffle Validation Schemas
export const createRaffleSchema = z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    ticketPrice: z
        .number({ message: 'Ticket price must be a number' })
        .min(100, 'Minimum ticket price is ₦100'),
    ticketsTotal: z
        .number({ message: 'Total tickets must be a number' })
        .int('Total tickets must be a whole number')
        .min(2, 'Minimum 2 tickets per raffle'),
    raffleDate: z.string().min(1, 'Raffle date is required'),
});

export const updateRaffleSchema = z.object({
    ticketPrice: z.number().min(100).optional(),
    ticketsTotal: z.number().int().min(2).optional(),
    raffleDate: z.string().optional(),
    status: z.enum(['SCHEDULED', 'ACTIVE', 'CANCELLED']).optional(),
});

// Ticket Validation Schemas
export const buyTicketSchema = z.object({
    raffleId: z.string().min(1, 'Raffle ID is required'),
    paymentMethod: z.enum(['wallet', 'points'], {
        message: 'Payment method must be "wallet" or "points"',
    }),
});
