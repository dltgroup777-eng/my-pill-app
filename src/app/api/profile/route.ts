import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const token = authHeader.slice(7);
        const payload = verifyAccessToken(token);
        if (!payload) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, ageBand, liverIssue, kidneyIssue, bleedingRisk, pregnancyLactation } = body;

        // 프로필 생성 또는 업데이트
        const profile = await prisma.userProfile.upsert({
            where: { userId: payload.userId },
            update: { name, ageBand, liverIssue, kidneyIssue, bleedingRisk, pregnancyLactation },
            create: {
                userId: payload.userId,
                name,
                ageBand,
                liverIssue: liverIssue || false,
                kidneyIssue: kidneyIssue || false,
                bleedingRisk: bleedingRisk || false,
                pregnancyLactation: pregnancyLactation || false,
            },
        });

        await prisma.eventLog.create({
            data: { userId: payload.userId, event: 'profile_updated' },
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Profile error:', error);
        return NextResponse.json({ error: '프로필 저장 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const token = authHeader.slice(7);
        const payload = verifyAccessToken(token);
        if (!payload) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId: payload.userId },
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: '프로필 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
