'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './results.module.css';

// ==========================================
// 🧪 개발 테스트 모드
// ==========================================
const DEV_MODE = true;

interface AnalysisResult {
    ruleId: string;
    level: 'danger' | 'warning' | 'notice';
    category: string;
    triggerIngredient: { code: string; nameKo: string };
    targetIngredient?: { code: string; nameKo: string };
    message: {
        conclusion: string;
        reason: string;
        action: string;
    };
    evidenceUrl?: string;
    personalizedNote?: string;
}

interface AnalysisData {
    overallRisk: 'danger' | 'warning' | 'notice';
    results: AnalysisResult[];
    matchedIngredients: { original: string; standardName: string }[];
    baselineIngredients?: string[];
    processingTime?: number;
}

export default function ResultsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalysisData | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');

        if (!stored) {
            // 🧪 개발 모드: 결과 없으면 샘플 데이터 사용
            if (DEV_MODE) {
                const sampleData: AnalysisData = {
                    overallRisk: 'danger',
                    results: [
                        {
                            ruleId: 'sample-1',
                            level: 'danger',
                            category: 'ddi',
                            triggerIngredient: { code: 'WARFARIN', nameKo: '와파린' },
                            targetIngredient: { code: 'ASPIRIN', nameKo: '아스피린' },
                            message: {
                                conclusion: '🚨 심각한 출혈 위험!',
                                reason: '와파린과 아스피린을 함께 복용하면 출혈 위험이 크게 증가합니다.',
                                action: '즉시 의사 또는 약사와 상담하세요.',
                            },
                            evidenceUrl: 'https://www.drugs.com/interactions-check.php',
                        },
                    ],
                    matchedIngredients: [{ original: '아스피린', standardName: '아스피린' }],
                    baselineIngredients: ['WARFARIN'],
                    processingTime: 42,
                };
                setData(sampleData);
                setTimeout(() => setShowPremiumModal(true), 1000);
                return;
            }

            router.push('/scan');
            return;
        }

        const parsed = JSON.parse(stored) as AnalysisData;
        setData(parsed);

        // Danger면 프리미엄 모달 표시
        if (parsed.overallRisk === 'danger') {
            setTimeout(() => setShowPremiumModal(true), 1500);
        }
    }, [router]);

    const toggleCard = (ruleId: string) => {
        setExpandedCards(prev => {
            const next = new Set(prev);
            if (next.has(ruleId)) {
                next.delete(ruleId);
            } else {
                next.add(ruleId);
            }
            return next;
        });
    };

    const getRiskStyle = (level: string) => {
        switch (level) {
            case 'danger':
                return styles.danger;
            case 'warning':
                return styles.warning;
            default:
                return styles.notice;
        }
    };

    const getRiskLabel = (level: string) => {
        switch (level) {
            case 'danger':
                return '위험';
            case 'warning':
                return '주의';
            default:
                return '참고';
        }
    };

    const getRiskEmoji = (level: string) => {
        switch (level) {
            case 'danger':
                return '🚨';
            case 'warning':
                return '⚠️';
            default:
                return '📌';
        }
    };

    if (!data) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>분석 결과를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* 🧪 개발 모드 표시 */}
            {DEV_MODE && (
                <div style={{
                    background: '#f59e0b',
                    color: '#000',
                    padding: '8px 16px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                }}>
                    🧪 개발 테스트 모드 - 샘플 분석 결과
                </div>
            )}

            {/* 헤더 */}
            <header className={`${styles.header} ${getRiskStyle(data.overallRisk)}`}>
                <div className={styles.riskBadge}>
                    <span className={styles.riskEmoji}>{getRiskEmoji(data.overallRisk)}</span>
                    <span className={styles.riskLabel}>{getRiskLabel(data.overallRisk)}</span>
                </div>
                <h1>
                    {data.overallRisk === 'danger' && '상호작용 위험이 발견되었습니다'}
                    {data.overallRisk === 'warning' && '주의가 필요한 조합입니다'}
                    {data.overallRisk === 'notice' && '안전하게 복용 가능합니다'}
                </h1>
                {data.processingTime && (
                    <p className={styles.processingTime}>분석 시간: {data.processingTime}ms</p>
                )}
            </header>

            {/* 분석된 성분 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span>📋</span> 분석된 성분
                </h2>
                <div className={styles.ingredientChips}>
                    {data.matchedIngredients.map((ing, i) => (
                        <span key={i} className={styles.chip}>
                            {ing.standardName || ing.original}
                        </span>
                    ))}
                </div>
                {data.baselineIngredients && data.baselineIngredients.length > 0 && (
                    <p className={styles.baselineNote}>
                        ※ 내 약상자 성분과 교차 분석됨
                    </p>
                )}
            </section>

            {/* 상호작용 결과 */}
            {data.results.length > 0 ? (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span>⚠️</span> 발견된 상호작용 ({data.results.length}건)
                    </h2>

                    <div className={styles.cardList}>
                        {data.results.map((result) => {
                            const isExpanded = expandedCards.has(result.ruleId);

                            return (
                                <div
                                    key={result.ruleId}
                                    className={`${styles.card} ${getRiskStyle(result.level)}`}
                                >
                                    <button
                                        className={styles.cardHeader}
                                        onClick={() => toggleCard(result.ruleId)}
                                    >
                                        <div className={styles.cardMain}>
                                            <span className={styles.cardBadge}>
                                                {getRiskEmoji(result.level)} {getRiskLabel(result.level)}
                                            </span>
                                            <h3>{result.message.conclusion}</h3>
                                            <p className={styles.interaction}>
                                                {result.triggerIngredient.nameKo}
                                                {result.targetIngredient && (
                                                    <> ↔ {result.targetIngredient.nameKo}</>
                                                )}
                                            </p>
                                        </div>
                                        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
                                            ▼
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div className={styles.cardBody}>
                                            <div className={styles.detailItem}>
                                                <strong>📖 원인</strong>
                                                <p>{result.message.reason}</p>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <strong>✅ 권장 조치</strong>
                                                <p>{result.message.action}</p>
                                            </div>
                                            {result.personalizedNote && (
                                                <div className={`${styles.detailItem} ${styles.personalized}`}>
                                                    <strong>👤 개인화 경고</strong>
                                                    <p>{result.personalizedNote}</p>
                                                </div>
                                            )}
                                            {result.evidenceUrl && (
                                                <a
                                                    href={result.evidenceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.evidenceLink}
                                                >
                                                    📚 근거 자료 보기
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ) : (
                <section className={styles.section}>
                    <div className={styles.safeMessage}>
                        <span className={styles.safeIcon}>✅</span>
                        <h3>위험한 상호작용이 발견되지 않았습니다</h3>
                        <p>분석 결과 안전하게 복용할 수 있습니다.</p>
                    </div>
                </section>
            )}

            {/* 하단 버튼 */}
            <div className={styles.actions}>
                <Link href="/scan" className={styles.secondaryButton}>
                    📷 다시 스캔
                </Link>
                <Link href="/products" className={styles.primaryButton}>
                    💊 내 약상자
                </Link>
            </div>

            {/* 면책 조항 */}
            <div className={styles.disclaimer}>
                <p>⚠️ 본 정보는 참고용이며, 전문 의료 상담을 대체하지 않습니다.</p>
            </div>

            {/* 프리미엄 모달 */}
            {showPremiumModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPremiumModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setShowPremiumModal(false)}>
                            ×
                        </button>
                        <div className={styles.modalIcon}>👨‍⚕️</div>
                        <h2>위험한 상호작용이 발견되었습니다</h2>
                        <p>
                            프리미엄 구독으로 전문 약사의 1:1 상담을 받아보세요.
                            맞춤형 약물 관리 플랜을 제공합니다.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.premiumButton}>
                                💎 프리미엄 구독하기
                            </button>
                            <button
                                className={styles.laterButton}
                                onClick={() => setShowPremiumModal(false)}
                            >
                                나중에
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
