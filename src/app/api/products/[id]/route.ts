/**
 * DELETE /api/products/[id] - 제품 삭제 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const payload = verifyAccessToken(authHeader.slice(7));
        if (!payload) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
        }

        const { id } = await params;

        // 소유권 확인
        const product = await prisma.product.findFirst({
            where: {
                id,
                userId: payload.userId,
            },
        });

        if (!product) {
            return NextResponse.json({ error: '제품을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 삭제 (관련 성분도 cascade로 삭제됨)
        await prisma.product.delete({
            where: { id },
        });

        await prisma.eventLog.create({
            data: {
                userId: payload.userId,
                event: 'product_deleted',
                metaJson: JSON.stringify({ productId: id, productName: product.name }),
            },
        });

        return NextResponse.json({ success: true, message: '제품이 삭제되었습니다.' });
    } catch (error) {
        console.error('Product delete error:', error);
        return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
