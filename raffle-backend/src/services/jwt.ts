import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { CONSTANTS } from '../config/constants';

interface TokenPayload {
    userId: string;
    role: string;
}

export interface TempTokenPayload {
    userId: string;
    method: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
    return jwt.sign(
        { userId, role } as TokenPayload,
        env.JWT_SECRET,
        { expiresIn: CONSTANTS.JWT_ACCESS_EXPIRY }
    );
};

export const generateRefreshToken = (userId: string, role: string): string => {
    return jwt.sign(
        { userId, role } as TokenPayload,
        env.JWT_REFRESH_SECRET,
        { expiresIn: CONSTANTS.JWT_REFRESH_EXPIRY }
    );
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const generateTempToken = (userId: string, method: string): string => {
    return jwt.sign(
        { userId, method } as TempTokenPayload,
        env.JWT_SECRET,
        { expiresIn: '5m' }
    );
};

export const verifyTempToken = (token: string): TempTokenPayload => {
    return jwt.verify(token, env.JWT_SECRET) as TempTokenPayload;
};

export const generateVerificationToken = (): string => {
    return crypto.randomUUID();
};

export const generateResetToken = (): string => {
    return crypto.randomUUID();
};

export const generateOTPCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
