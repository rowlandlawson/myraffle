// src/lib/validation.ts
import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Please enter a valid phone number',
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Withdrawal Schema (for Phase 2)
export const withdrawSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(1000, 'Minimum withdrawal is ₦1,000'),
  bankCode: z.string().min(1, 'Bank is required'),
  accountNumber: z
    .string()
    .min(10, 'Account number must be 10 digits')
    .max(10, 'Account number must be 10 digits'),
  accountName: z.string().min(2, 'Account name is required'),
});

export type WithdrawInput = z.infer<typeof withdrawSchema>;

// Item Upload Schema (for Phase 4 Admin)
export const itemUploadSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Image must be less than 5MB',
    ),
  ticketPrice: z.number().positive('Ticket price must be greater than 0'),
  totalTickets: z
    .number()
    .positive('Total tickets must be greater than 0')
    .int(),
  raffleDate: z
    .string()
    .refine(
      (date) => new Date(date) > new Date(),
      'Raffle date must be in the future',
    ),
  autoStart: z.boolean().optional(),
});

export type ItemUploadInput = z.infer<typeof itemUploadSchema>;
