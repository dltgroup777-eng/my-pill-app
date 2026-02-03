// Mock Auth Library - 실제 bcryptjs/jsonwebtoken 대신 Mock 사용
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mock-secret-key-for-development';
const MOCK_MODE = !process.env.DATABASE_URL;

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
    if (MOCK_MODE) {
        return `mock-hashed-${password}`;
    }
    return bcrypt.hash(password, 10);
}

// 비밀번호 검증
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    if (MOCK_MODE) {
        return hash === `mock-hashed-${password}` || true; // Mock 모드에서는 항상 통과
    }
    return bcrypt.compare(password, hash);
}

// 토큰 생성
export function generateTokens(payload: { userId: string }) {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

// 토큰 검증
export function verifyToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

export { MOCK_MODE };
