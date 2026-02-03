/**
 * /api/products - 내 약상자 관리 API
 * 
 * 새 스키마(ProductIngredient → StandardIngredient)에 맞게 업데이트됨
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { searchIngredient } from '@/lib/ocr-engine';

// 내 약상자 조회
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const payload = verifyAccessToken(authHeader.slice(7));
        if (!payload) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            where: { userId: payload.userId },
            include: {
                ingredients: {
                    include: {
                        standardIngredient: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // 응답 형식 정리
        const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            type: product.type,
            schedule: product.schedule,
            dosageText: product.dosageText,
            createdAt: product.createdAt,
            ingredients: product.ingredients.map(ing => ({
                id: ing.id,
                standardCode: ing.standardIngredient.code,
                standardName: ing.standardIngredient.nameKo,
                nameEn: ing.standardIngredient.nameEn,
                category: ing.standardIngredient.category,
                originalName: ing.originalName,
                amount: ing.amount,
                unit: ing.unit,
            })),
        }));

        return NextResponse.json({ products: formattedProducts });
    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json({ error: '제품 조회 중 오류 발생' }, { status: 500 });
    }
}

// 새 제품 등록
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const payload = verifyAccessToken(authHeader.slice(7));
        if (!payload) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, schedule, dosageText, ingredients } = body;

        // 성분명을 표준 성분으로 매핑
        const ingredientData: { standardIngredientId: string; originalName: string; amount?: number; unit?: string }[] = [];

        if (ingredients && Array.isArray(ingredients)) {
            for (const ing of ingredients) {
                const ingName = ing.standardName || ing.name || ing;

                // 별명 검색으로 표준 성분 찾기
                const matches = await searchIngredient(typeof ingName === 'string' ? ingName : String(ingName), 1);

                if (matches.length > 0) {
                    // 표준 성분 ID 조회
                    const standardIng = await prisma.standardIngredient.findUnique({
                        where: { code: matches[0].code },
                    });

                    if (standardIng) {
                        ingredientData.push({
                            standardIngredientId: standardIng.id,
                            originalName: ingName,
                            amount: ing.amount,
                            unit: ing.unit,
                        });
                    }
                }
            }
        }

        const product = await prisma.product.create({
            data: {
                userId: payload.userId,
                name,
                type: type || 'supplement',
                schedule: JSON.stringify(schedule || {}),
                dosageText,
                ingredients: {
                    create: ingredientData,
                },
            },
            include: {
                ingredients: {
                    include: {
                        standardIngredient: true,
                    },
                },
            },
        });

        await prisma.eventLog.create({
            data: {
                userId: payload.userId,
                event: 'product_added',
                metaJson: JSON.stringify({
                    productId: product.id,
                    ingredientCount: ingredientData.length,
                }),
            },
        });

        return NextResponse.json({
            product: {
                id: product.id,
                name: product.name,
                type: product.type,
                ingredients: product.ingredients.map(ing => ({
                    standardCode: ing.standardIngredient.code,
                    standardName: ing.standardIngredient.nameKo,
                    originalName: ing.originalName,
                })),
            },
            matchedCount: ingredientData.length,
            message: ingredientData.length > 0
                ? `${ingredientData.length}개 성분이 등록되었습니다.`
                : '성분을 매칭하지 못했습니다. 성분명을 다시 확인해주세요.',
        });
    } catch (error) {
        console.error('Product create error:', error);
        return NextResponse.json({ error: '제품 등록 중 오류 발생' }, { status: 500 });
    }
}
