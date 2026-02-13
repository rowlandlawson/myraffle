import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { CONSTANTS } from '../config/constants';

interface TokenPayload {
    userId: string;
    role: string;
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

export const generateVerificationToken = (): string => {
    return crypto.randomUUID();
};

export const generateResetToken = (): string => {
    return crypto.randomUUID();
};
