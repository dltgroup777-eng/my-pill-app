import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { analyzeIngredients, getHighestRisk, type UserCondition } from '@/lib/rule-engine';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        let userId: string | null = null;
        let userCondition: UserCondition | undefined;

        // 인증된 사용자면 프로필 정보 가져오기
        if (authHeader?.startsWith('Bearer ')) {
            const payload = verifyAccessToken(authHeader.slice(7));
            if (payload) {
                userId = payload.userId;
                const profile = await prisma.userProfile.findUnique({
                    where: { userId: payload.userId },
                });
                if (profile) {
                    userCondition = {
                        liverIssue: profile.liverIssue,
                        kidneyIssue: profile.kidneyIssue,
                        bleedingRisk: profile.bleedingRisk,
                        pregnancyLactation: profile.pregnancyLactation,
                        ageBand: profile.ageBand,
                    };
                }
            }
        }

        const { ingredients } = await request.json();

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return NextResponse.json({ error: '분석할 성분을 입력해주세요.' }, { status: 400 });
        }

        // 위험 분석 실행
        const results = await analyzeIngredients(ingredients, userCondition);
        const highestRisk = getHighestRisk(results);

        // 스캔 로그 저장
        if (userId) {
            await prisma.scanLog.create({
                data: {
                    userId,
                    ingredientsJson: JSON.stringify(ingredients),
                    resultRisk: highestRisk,
                    resultsJson: JSON.stringify(results),
                },
            });

            // 이벤트 로깅
            await prisma.eventLog.create({
                data: {
                    userId,
                    event: 'scan_completed',
                    metaJson: JSON.stringify({
                        ingredientCount: ingredients.length,
                        resultCount: results.length,
                        highestRisk,
                    }),
                },
            });

            // Danger 결과가 있으면 별도 이벤트
            if (highestRisk === 'danger') {
                await prisma.eventLog.create({
                    data: {
                        userId,
                        event: 'danger_exposed',
                        metaJson: JSON.stringify({ results: results.filter(r => r.level === 'danger') }),
                    },
                });
            }
        }

        return NextResponse.json({
            ingredients,
            results,
            highestRisk,
            analyzedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
