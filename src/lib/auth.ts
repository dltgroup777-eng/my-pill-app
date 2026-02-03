import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

export function generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, ACCESS_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
