'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Result { ruleId: string; level: string; category: string; triggerIngredient: { code: string; nameKo: string }; targetIngredient?: { code: string; nameKo: string }; message: { conclusion: string; reason: string; action: string } }
interface AnalysisData { overallRisk: string; results: Result[]; matchedIngredients: { original: string; standardName: string }[] }

export default function ResultsPage() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('analysisResult');
        if (saved) {
            const parsed = JSON.parse(saved);
            setData(parsed);
            if (parsed.overallRisk === 'danger') setTimeout(() => setShowPremiumModal(true), 1500);
        } else {
            // Mock 데이터
            setData({ overallRisk: 'warning', results: [{ ruleId: 'demo-1', level: 'warning', category: 'ddi', triggerIngredient: { code: 'WARFARIN', nameKo: '와파린' }, targetIngredient: { code: 'ASPIRIN', nameKo: '아스피린' }, message: { conclusion: '출혈 위험 주의', reason: '항응고 효과가 상승할 수 있습니다', action: '의사와 상담하세요' } }], matchedIngredients: [{ original: '아스피린', standardName: '아스피린' }] });
        }
    }, []);

    const getRiskStyle = (level: string) => ({ danger: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#fca5a5', icon: '🚨', label: '위험' }, warning: { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', color: '#fdba74', icon: '⚠️', label: '주의' }, notice: { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', color: '#fde047', icon: '💡', label: '참고' } }[level] || { bg: 'rgba(255,255,255,0.1)', border: '#64748b', color: '#94a3b8', icon: 'ℹ️', label: '정보' });

    if (!data) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628' }}><div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

    const overallStyle = getRiskStyle(data.overallRisk);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff', paddingBottom: 100 }}>
            <header style={{ padding: '24px 16px', textAlign: 'center', background: overallStyle.bg, borderBottom: `1px solid ${overallStyle.border}` }}>
                <span style={{ fontSize: 48 }}>{overallStyle.icon}</span>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 8, marginBottom: 4, color: overallStyle.color }}>{overallStyle.label}</h1>
                <p style={{ fontSize: 14, color: '#94a3b8' }}>{data.results.length > 0 ? `${data.results.length}건의 주의사항이 있습니다` : '검출된 상호작용이 없습니다'}</p>
            </header>

            <section style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>💊 분석된 성분</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {data.matchedIngredients.map((ing, i) => <span key={i} style={{ padding: '8px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, fontSize: 13, color: '#6ee7b7' }}>✓ {ing.standardName}</span>)}
                </div>
            </section>

            {data.results.length > 0 && (
                <section style={{ padding: '0 16px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>⚠️ 상호작용 상세</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {data.results.map((r) => {
                            const style = getRiskStyle(r.level);
                            const isExpanded = expandedId === r.ruleId;
                            return (
                                <div key={r.ruleId} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 16, overflow: 'hidden' }}>
                                    <button onClick={() => setExpandedId(isExpanded ? null : r.ruleId)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: 16, textAlign: 'left', background: 'none' }}>
                                        <span style={{ fontSize: 24, marginRight: 12 }}>{style.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <span style={{ fontSize: 15, fontWeight: 700, color: style.color }}>{r.triggerIngredient.nameKo}</span>
                                                {r.targetIngredient && <><span style={{ color: '#64748b' }}>+</span><span style={{ fontSize: 15, fontWeight: 700, color: style.color }}>{r.targetIngredient.nameKo}</span></>}
                                            </div>
                                            <p style={{ fontSize: 14, color: '#e2e8f0' }}>{r.message.conclusion}</p>
                                        </div>
                                        <span style={{ fontSize: 20, color: '#64748b', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                                    </button>
                                    {isExpanded && (
                                        <div style={{ padding: 16, paddingTop: 0, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                                            <div style={{ marginBottom: 12 }}><h4 style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>왜 위험한가요?</h4><p style={{ fontSize: 14, color: '#e2e8f0' }}>{r.message.reason}</p></div>
                                            <div><h4 style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>어떻게 해야 하나요?</h4><p style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>{r.message.action}</p></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {data.results.length === 0 && (
                <section style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>✅</span>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>이상 없음!</h2>
                    <p style={{ fontSize: 14, color: '#94a3b8' }}>분석된 성분 간 특별한 상호작용이 발견되지 않았습니다.</p>
                </section>
            )}

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 'max(16px, env(safe-area-inset-bottom))', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/scan" style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 14, textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: 600 }}>📷 다시 스캔</Link>
                    <Link href="/home" style={{ flex: 1, padding: 16, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 14, textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: 600 }}>🏠 홈으로</Link>
                </div>
            </div>

            {showPremiumModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 200 }}>
                    <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(180deg, #1a2744 0%, #0f172a 100%)', borderRadius: 24, padding: 24, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: 48 }}>🚨</span>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '16px 0 8px', color: '#ef4444' }}>심각한 위험 발견</h2>
                        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>전문 약사의 1:1 상담을 받아보세요</p>
                        <button onClick={() => setShowPremiumModal(false)} style={{ width: '100%', padding: 18, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: 14, color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 12 }}>👨‍⚕️ 프리미엄 상담 (₩9,900)</button>
                        <button onClick={() => setShowPremiumModal(false)} style={{ color: '#64748b', fontSize: 14 }}>나중에</button>
                    </div>
                </div>
            )}
        </div>
    );
}
