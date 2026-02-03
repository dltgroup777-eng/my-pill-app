'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './premium.module.css';

export default function PremiumPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.url) {
                // Stripe 결제 페이지로 리다이렉트 (또는 테스트 모드)
                window.location.href = data.url;
            } else if (data.success) {
                // 테스트 모드 - 바로 Premium 활성화
                alert('🎉 Premium이 활성화되었습니다!');
                router.push('/home');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>PREMIUM</div>
                <h1 className={styles.title}>더 안전한 복용을 위해</h1>

                <div className={styles.price}>
                    <span className={styles.amount}>₩9,900</span>
                    <span className={styles.period}>/월</span>
                </div>

                <ul className={styles.features}>
                    <li>✅ 개인 건강 상태 맞춤 분석</li>
                    <li>✅ Danger 위험 상세 설명</li>
                    <li>✅ PDF 분석 리포트 다운로드</li>
                    <li>✅ 가족 프로필 2개 추가</li>
                    <li>✅ 우선 고객 지원</li>
                </ul>

                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSubscribe}
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {loading ? '처리 중...' : 'Premium 시작하기'}
                </button>

                <p className={styles.guarantee}>
                    7일 무료 체험 · 언제든 취소 가능
                </p>
            </div>

            <div className={styles.comparison}>
                <h2>무료 vs Premium</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>기능</th>
                            <th>무료</th>
                            <th>Premium</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>기본 상호작용 분석</td><td>✅</td><td>✅</td></tr>
                        <tr><td>중복 성분 검사</td><td>✅</td><td>✅</td></tr>
                        <tr><td>개인 맞춤 분석</td><td>❌</td><td>✅</td></tr>
                        <tr><td>상세 위험 설명</td><td>❌</td><td>✅</td></tr>
                        <tr><td>PDF 리포트</td><td>❌</td><td>✅</td></tr>
                        <tr><td>가족 프로필</td><td>❌</td><td>✅ (2개)</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="disclaimer">
                ⚠️ 본 서비스는 의료 행위가 아닙니다.
            </div>
        </div>
    );
}
