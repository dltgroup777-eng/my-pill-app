/**
 * POST /api/scan
 * 
 * 이미지 또는 텍스트로 성분을 분석하고 상호작용을 검사합니다.
 * 새로운 스키마(StandardIngredient, InteractionRule)와 연동.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractIngredientsFromText, searchIngredient, type ExtractedIngredient } from '@/lib/ocr-engine';
import { analyzeInteractions } from '@/lib/rule-engine';
import { verifyAccessToken } from '@/lib/auth';

// 사용자 인증 헬퍼
function getUserFromToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    return payload?.userId || null;
}

export async function POST(request: NextRequest) {
    try {
        // 1. 사용자 인증
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        // 2. 요청 본문 파싱
        const body = await request.json();
        const { ingredients: rawIngredients, text, mode = 'text' } = body;

        let extractedIngredients: ExtractedIngredient[] = [];

        // 3. 성분 추출
        if (mode === 'text' && text) {
            // 텍스트 직접 입력
            const result = await extractIngredientsFromText(text);
            extractedIngredients = result.ingredients;
        } else if (mode === 'ingredients' && rawIngredients && Array.isArray(rawIngredients)) {
            // 성분명 배열 직접 전달
            for (const name of rawIngredients) {
                const matches = await searchIngredient(name, 1);
                if (matches.length > 0) {
                    extractedIngredients.push({
                        originalText: name,
                        standardCode: matches[0].code,
                        standardNameKo: matches[0].nameKo,
                        confidence: 1.0,
                    });
                } else {
                    // 매칭 안 된 성분도 기록
                    extractedIngredients.push({
                        originalText: name,
                        standardCode: null,
                        standardNameKo: null,
                        confidence: 0,
                    });
                }
            }
        } else {
            return NextResponse.json(
                { error: '분석할 성분 정보가 필요합니다.' },
                { status: 400 }
            );
        }

        // 4. 매칭된 성분이 없으면 반환
        const matchedIngredients = extractedIngredients.filter(i => i.standardCode);
        const unmatchedIngredients = extractedIngredients.filter(i => !i.standardCode);

        if (matchedIngredients.length === 0) {
            return NextResponse.json({
                success: true,
                scannedCount: extractedIngredients.length,
                matchedCount: 0,
                unmatchedIngredients: unmatchedIngredients.map(i => i.originalText),
                overallRisk: 'notice',
                results: [],
                message: '인식된 성분 중 데이터베이스에 등록된 성분이 없습니다. 직접 입력해주세요.',
            });
        }

        // 5. 상호작용 분석
        const analysisReport = await analyzeInteractions(matchedIngredients, userId);

        // 6. 스캔 기록 저장
        await prisma.scanLog.create({
            data: {
                userId,
                ingredientsJson: JSON.stringify(matchedIngredients.map(i => ({
                    code: i.standardCode,
                    name: i.standardNameKo,
                    original: i.originalText,
                }))),
                resultRisk: analysisReport.overallRisk,
                resultsJson: JSON.stringify(analysisReport.results),
                ocrText: text || rawIngredients?.join(', '),
            },
        });

        // 7. 이벤트 로깅
        await prisma.eventLog.create({
            data: {
                userId,
                event: 'scan_completed',
                metaJson: JSON.stringify({
                    ingredientCount: matchedIngredients.length,
                    riskLevel: analysisReport.overallRisk,
                    interactionCount: analysisReport.results.length,
                }),
            },
        });

        // 8. 응답 반환
        return NextResponse.json({
            success: true,
            scannedCount: extractedIngredients.length,
            matchedCount: matchedIngredients.length,
            unmatchedIngredients: unmatchedIngredients.map(i => i.originalText),
            matchedIngredients: matchedIngredients.map(i => ({
                original: i.originalText,
                standardCode: i.standardCode,
                standardName: i.standardNameKo,
                confidence: i.confidence,
                amount: i.amount,
                unit: i.unit,
            })),
            overallRisk: analysisReport.overallRisk,
            results: analysisReport.results,
            baselineIngredients: analysisReport.baselineIngredients,
            processingTime: analysisReport.processingTime,
        });

    } catch (error) {
        console.error('Scan API error:', error);
        return NextResponse.json(
            { error: '분석 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 성분 자동완성 검색
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 1) {
            return NextResponse.json({ results: [] });
        }

        const results = await searchIngredient(query, 10);

        return NextResponse.json({
            results: results.map(r => ({
                code: r.code,
                nameKo: r.nameKo,
                nameEn: r.nameEn,
                category: r.category,
            })),
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: '검색 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
