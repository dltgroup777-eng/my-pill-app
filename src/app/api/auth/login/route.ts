import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateTokens } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: '이메일과 비밀번호를 입력해주세요.' },
                { status: 400 }
            );
        }

        // 사용자 찾기
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
                { status: 401 }
            );
        }

        // 비밀번호 검증
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
                { status: 401 }
            );
        }

        // 이벤트 로깅
        await prisma.eventLog.create({
            data: { userId: user.id, event: 'user_login' },
        });

        // 토큰 생성
        const tokens = generateTokens({ userId: user.id, email: user.email });

        return NextResponse.json({
            ...tokens,
            hasProfile: !!user.profile,
            user: { id: user.id, email: user.email, premium: user.premium },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: '로그인 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
