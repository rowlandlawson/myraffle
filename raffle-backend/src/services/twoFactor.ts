// src/services/twoFactor.ts
// Two-Factor Authentication service — supports Email OTP and TOTP (Authenticator App)
// Uses otplib v14+ API

import { generateSecret as otplibGenerateSecret, generateSync, verifySync, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { generateOTPCode } from './jwt';
import { sendEmailOTP } from './brevo';

const APP_NAME = 'RaffleHub';

// ─── TOTP (Authenticator App) ───────────────────────────────

/** Generate a new TOTP secret for authenticator app setup */
export function generateSecret(): string {
    return otplibGenerateSecret();
}

/** Generate a QR code data URI for scanning with Google Authenticator / Authy */
export async function generateQRCodeURL(
    secret: string,
    userEmail: string,
): Promise<string> {
    const otpauth = generateURI({
        secret,
        issuer: APP_NAME,
        label: userEmail,
    });
    return QRCode.toDataURL(otpauth);
}

/** Verify a TOTP code against a secret */
export function verifyTOTPToken(token: string, secret: string): boolean {
    try {
        const result = verifySync({ token, secret });
        return result.valid;
    } catch {
        return false;
    }
}

// ─── Email OTP ──────────────────────────────────────────────

/** Send a 2FA email OTP (wrapper around existing Brevo service) */
export async function send2FAEmailOTP(
    email: string,
    name: string,
    otp: string,
): Promise<boolean> {
    return sendEmailOTP(email, name, otp);
}

/** Generate and send a 2FA email OTP, returning the code and expiry */
export async function generateAndSend2FAEmailOTP(
    email: string,
    name: string,
): Promise<{ code: string; expiry: Date }> {
    const code = generateOTPCode();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await sendEmailOTP(email, name, code);

    return { code, expiry };
}
