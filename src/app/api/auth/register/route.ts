import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateTokens } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: '이메일과 비밀번호를 입력해주세요.' },
                { status: 400 }
            );
        }

        // 이메일 중복 확인
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: '이미 사용 중인 이메일입니다.' },
                { status: 409 }
            );
        }

        // 사용자 생성
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, passwordHash },
        });

        // 이벤트 로깅
        await prisma.eventLog.create({
            data: { userId: user.id, event: 'user_registered' },
        });

        // 토큰 생성
        const tokens = generateTokens({ userId: user.id, email: user.email });

        return NextResponse.json({
            ...tokens,
            user: { id: user.id, email: user.email },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: '회원가입 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
