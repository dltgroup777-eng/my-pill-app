import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

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

        // Stripe 키가 설정되어 있지 않으면 테스트 모드
        const stripeKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeKey) {
            // 테스트 모드: 바로 Premium 활성화
            const premiumUntil = new Date();
            premiumUntil.setMonth(premiumUntil.getMonth() + 1);

            await prisma.user.update({
                where: { id: payload.userId },
                data: { premium: true, premiumUntil },
            });

            await prisma.eventLog.create({
                data: {
                    userId: payload.userId,
                    event: 'payment_success',
                    metaJson: JSON.stringify({ mode: 'test', amount: 9900 }),
                },
            });

            return NextResponse.json({ success: true, message: 'Premium 활성화 완료 (테스트 모드)' });
        }

        // Stripe 결제 세션 생성
        const stripe = require('stripe')(stripeKey);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price_data: {
                    currency: 'krw',
                    product_data: { name: '복용약 관리 에이전트 Premium' },
                    unit_amount: 9900,
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
            client_reference_id: payload.userId,
        });

        await prisma.eventLog.create({
            data: {
                userId: payload.userId,
                event: 'payment_start',
                metaJson: JSON.stringify({ sessionId: session.id }),
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);

        await prisma.eventLog.create({
            data: { event: 'payment_fail', metaJson: JSON.stringify({ error: String(error) }) },
        });

        return NextResponse.json({ error: '결제 세션 생성 중 오류 발생' }, { status: 500 });
    }
}
