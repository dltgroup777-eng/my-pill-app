'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './results.module.css';

const DEV_MODE = true;
const INTERACTION_DETAILS: Record<string, { mechanism: string; clinicalSignificance: string; onsetTime: string; symptoms: string[]; management: string[]; alternatives: string[]; references: string[] }> = {
    'WARFARIN-ASPIRIN': { mechanism: '아스피린은 혈소판 응집을 억제하고, 와파린은 비타민K 의존성 응고인자 합성을 저해합니다. 두 약물의 병용은 출혈 위험을 상승적으로 증가시킵니다.', clinicalSignificance: '임상적으로 매우 중요한 상호작용입니다. 대규모 연구에서 병용 시 주요 출혈 위험이 2-3배 증가하는 것으로 보고되었습니다.', onsetTime: '수 시간 내 영향 발현, 최대 효과는 수일 소요', symptoms: ['비정상적인 멍', '코피', '잇몸 출혈', '혈뇨', '흑색변', '두통 (뇌출혈 가능성)', '피로감'], management: ['의사와 상담 전까지 아스피린 복용 중단 고려', 'INR 수치 모니터링 강화', '출혈 증상 발생 시 즉시 응급실 방문', '위장보호제(PPI) 병용 고려'], alternatives: ['아세트아미노펜(타이레놀) - 진통 목적 시', '심혈관 적응증 시 의사와 용량 조절 상담'], references: ['ACCF/AHA 2011 Guideline', 'UpToDate: Warfarin drug interactions', 'KDIC 의약품상호작용 데이터베이스'] },
};

interface AnalysisResult { ruleId: string; level: 'danger' | 'warning' | 'notice'; category: string; triggerIngredient: { code: string; nameKo: string }; targetIngredient?: { code: string; nameKo: string }; message: { conclusion: string; reason: string; action: string }; personalizedNote?: string; }
interface AnalysisData { overallRisk: 'danger' | 'warning' | 'notice'; results: AnalysisResult[]; matchedIngredients: { original: string; standardName: string }[]; baselineIngredients?: string[]; processingTime?: number; }

export default function ResultsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalysisData | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');
        if (!stored) {
            if (DEV_MODE) { const sampleData: AnalysisData = { overallRisk: 'danger', results: [{ ruleId: 'rule-warfarin-aspirin', level: 'danger', category: 'ddi', triggerIngredient: { code: 'WARFARIN', nameKo: '와파린' }, targetIngredient: { code: 'ASPIRIN', nameKo: '아스피린' }, message: { conclusion: '심각한 출혈 위험 증가', reason: '두 약물 모두 혈액 응고를 억제하여 상승 효과 발생', action: '즉시 의사 또는 약사와 상담하세요' } }], matchedIngredients: [{ original: '아스피린', standardName: '아스피린' }], baselineIngredients: ['WARFARIN'], processingTime: 127 }; setData(sampleData); setTimeout(() => setShowPremiumModal(true), 2000); return; }
            router.push('/scan'); return;
        }
        const parsed = JSON.parse(stored) as AnalysisData; setData(parsed);
        if (parsed.overallRisk === 'danger') setTimeout(() => setShowPremiumModal(true), 2000);
    }, [router]);

    const toggleCard = (ruleId: string) => setExpandedCards(prev => { const next = new Set(prev); if (next.has(ruleId)) next.delete(ruleId); else next.add(ruleId); return next; });
    const getInteractionKey = (trigger: string, target?: string) => target ? `${trigger}-${target}` : trigger;
    const getRiskConfig = (level: string) => { switch (level) { case 'danger': return { class: styles.danger, icon: '🚨', label: '위험', color: '#ef4444' }; case 'warning': return { class: styles.warning, icon: '⚠️', label: '주의', color: '#f59e0b' }; default: return { class: styles.notice, icon: '💡', label: '참고', color: '#3b82f6' }; } };

    if (!data) return <div className={styles.loading}><div className={styles.spinner}></div><p>분석 결과 로딩 중...</p></div>;
    const overallConfig = getRiskConfig(data.overallRisk);

    return (
        <div className={styles.container}>
            <header className={`${styles.header} ${overallConfig.class}`}><div className={styles.headerBadge}><span className={styles.headerIcon}>{overallConfig.icon}</span><span className={styles.headerLabel}>{overallConfig.label}</span></div><h1 className={styles.headerTitle}>{data.overallRisk === 'danger' && '상호작용 위험이 발견되었습니다'}{data.overallRisk === 'warning' && '주의가 필요한 조합입니다'}{data.overallRisk === 'notice' && '안전하게 복용 가능합니다'}</h1><p className={styles.headerSubtitle}>{data.matchedIngredients.length}개 성분 분석 완료{data.processingTime && ` · ${data.processingTime}ms`}</p></header>
            <section className={styles.section}><h2 className={styles.sectionTitle}><span>📋</span> 분석 대상</h2><div className={styles.ingredientTags}>{data.matchedIngredients.map((ing, i) => <span key={i} className={styles.ingredientTag}>{ing.standardName || ing.original}</span>)}</div>{data.baselineIngredients && data.baselineIngredients.length > 0 && <div className={styles.baselineNote}><span>💊</span><span>내 약상자 ({data.baselineIngredients.length}개)와 교차 분석됨</span></div>}</section>
            {data.results.length > 0 ? (
                <section className={styles.section}><h2 className={styles.sectionTitle}><span>⚡</span> 약물 상호작용 분석</h2>
                    {data.results.map((result) => {
                        const config = getRiskConfig(result.level); const isExpanded = expandedCards.has(result.ruleId); const interactionKey = getInteractionKey(result.triggerIngredient.code, result.targetIngredient?.code); const details = INTERACTION_DETAILS[interactionKey];
                        return <div key={result.ruleId} className={`${styles.card} ${config.class}`}>
                            <div className={styles.cardHeader}><div className={styles.cardBadge} style={{ background: config.color }}>{config.icon} {config.label}</div><span className={styles.cardCategory}>{result.category === 'ddi' ? '약물-약물' : '약물-음식'}</span></div>
                            <div className={styles.interactionPair}><div className={styles.drugPill} style={{ borderColor: config.color }}>💊 {result.triggerIngredient.nameKo}</div><span className={styles.interactionArrow}>⚡</span>{result.targetIngredient && <div className={styles.drugPill} style={{ borderColor: config.color }}>💊 {result.targetIngredient.nameKo}</div>}</div>
                            <h3 className={styles.cardConclusion}>{result.message.conclusion}</h3><p className={styles.cardReason}>{result.message.reason}</p>
                            <div className={styles.actionBox}><strong>✅ 권장 조치</strong><p>{result.message.action}</p></div>
                            <button className={styles.expandBtn} onClick={() => toggleCard(result.ruleId)}>{isExpanded ? '▲ 간략히 보기' : '▼ 전문 정보 더보기'}</button>
                            {isExpanded && details && <div className={styles.expandedContent}><div className={styles.detailSection}><h4>🔬 작용 기전</h4><p>{details.mechanism}</p></div><div className={styles.detailSection}><h4>📊 임상적 중요성</h4><p>{details.clinicalSignificance}</p><p className={styles.onset}>발현 시간: {details.onsetTime}</p></div><div className={styles.detailSection}><h4>🩺 주의해야 할 증상</h4><ul className={styles.symptomList}>{details.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul></div><div className={styles.detailSection}><h4>📋 관리 방법</h4><ol className={styles.managementList}>{details.management.map((m, i) => <li key={i}>{m}</li>)}</ol></div><div className={styles.detailSection}><h4>💡 대안 약물</h4><ul className={styles.alternativesList}>{details.alternatives.map((a, i) => <li key={i}>{a}</li>)}</ul></div><div className={styles.references}><h4>📚 참고문헌</h4>{details.references.map((r, i) => <span key={i} className={styles.refTag}>{r}</span>)}</div></div>}
                        </div>;
                    })}
                </section>
            ) : <section className={styles.section}><div className={styles.safeResult}><div className={styles.safeIcon}>✅</div><h3>위험한 상호작용이 발견되지 않았습니다</h3><p>분석된 성분들은 안전하게 함께 복용할 수 있습니다.</p></div></section>}
            <div className={styles.disclaimer}><span>⚠️</span><p>본 정보는 참고용이며, 전문 의료 상담을 대체하지 않습니다.</p></div>
            <div className={styles.bottomActions}><Link href="/scan" className={styles.secondaryBtn}>📷 다시 스캔</Link><Link href="/products" className={styles.primaryBtn}>💊 내 약상자</Link></div>
            {showPremiumModal && data.overallRisk === 'danger' && <div className={styles.modalOverlay} onClick={() => setShowPremiumModal(false)}><div className={styles.modal} onClick={e => e.stopPropagation()}><button className={styles.modalClose} onClick={() => setShowPremiumModal(false)}>×</button><div className={styles.modalIcon}>👨‍⚕️</div><h2>전문가 상담이 필요해 보여요</h2><p className={styles.modalDesc}>발견된 상호작용에 대해 전문 약사의 1:1 상담을 받아보세요.</p><ul className={styles.modalFeatures}><li><span>✓</span> 개인 맞춤 복약 상담</li><li><span>✓</span> 대안 약물 추천</li><li><span>✓</span> 복용 스케줄 관리</li></ul><button className={styles.premiumBtn}>💎 프리미엄 상담 받기</button><button className={styles.laterBtn} onClick={() => setShowPremiumModal(false)}>나중에 할게요</button></div></div>}
        </div>
    );
}
