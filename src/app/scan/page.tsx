'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MOCK_SEARCH = [
    { code: 'ASPIRIN', nameKo: '아스피린', category: '해열진통제' },
    { code: 'IBUPROFEN', nameKo: '이부프로펜', category: 'NSAID' },
    { code: 'ACETAMINOPHEN', nameKo: '아세트아미노펜', category: '해열진통제' },
    { code: 'WARFARIN', nameKo: '와파린', category: '항응고제' },
    { code: 'OMEGA3', nameKo: '오메가3', category: '오메가지방산' },
];

interface Ingredient { code: string; nameKo: string; original: string; }

export default function ScanPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [mode, setMode] = useState<'camera' | 'search'>('search');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH>([]);
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [ocrLoading, setOcrLoading] = useState(false);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setCameraActive(true); }
        } catch (err) {
            const error = err as Error;
            if (error.name === 'NotAllowedError') setCameraError('카메라 권한이 거부되었습니다.\n설정에서 권한을 허용해주세요.');
            else setCameraError('카메라를 시작할 수 없습니다.\n갤러리에서 이미지를 선택해주세요.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraActive(false);
    }, []);

    useEffect(() => { if (mode !== 'camera') stopCamera(); return () => stopCamera(); }, [mode, stopCamera]);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current, c = canvasRef.current;
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext('2d')?.drawImage(v, 0, 0);
        setPreviewImage(c.toDataURL('image/jpeg', 0.9));
        stopCamera();
        setOcrLoading(true);
        setTimeout(() => { setIngredients([{ code: 'ASPIRIN', nameKo: '아스피린', original: '아스피린 500mg' }]); setOcrLoading(false); }, 2000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setPreviewImage(ev.target?.result as string); setOcrLoading(true); setTimeout(() => { setIngredients([{ code: 'ASPIRIN', nameKo: '아스피린', original: '아스피린 500mg' }]); setOcrLoading(false); }, 2000); };
        reader.readAsDataURL(file);
    };

    const handleSearch = (q: string) => { setInputValue(q); setSearchResults(q.length < 1 ? [] : MOCK_SEARCH.filter(r => r.nameKo.includes(q))); };
    const selectIngredient = (r: typeof MOCK_SEARCH[0]) => { if (!ingredients.find(i => i.code === r.code)) setIngredients(p => [...p, { code: r.code, nameKo: r.nameKo, original: r.nameKo }]); setInputValue(''); setSearchResults([]); };

    const handleAnalyze = () => {
        if (ingredients.length === 0) return;
        setLoading(true);
        const hasAspirin = ingredients.some(i => i.code === 'ASPIRIN');
        const hasWarfarin = ingredients.some(i => i.code === 'WARFARIN');
        let result;
        if (hasAspirin && hasWarfarin) {
            result = { overallRisk: 'danger', results: [{ ruleId: 'rule-1', level: 'danger', triggerIngredient: { nameKo: '와파린' }, targetIngredient: { nameKo: '아스피린' }, message: { conclusion: '심각한 출혈 위험 증가', reason: '두 약물 모두 혈액 응고를 억제', action: '즉시 의사와 상담하세요' } }], matchedIngredients: ingredients.map(i => ({ original: i.original, standardName: i.nameKo })) };
        } else if (hasAspirin) {
            result = { overallRisk: 'warning', results: [{ ruleId: 'rule-2', level: 'warning', triggerIngredient: { nameKo: '아스피린' }, message: { conclusion: '위장 자극 주의', reason: '공복 복용 시 위장 자극 가능', action: '식후 복용을 권장합니다' } }], matchedIngredients: ingredients.map(i => ({ original: i.original, standardName: i.nameKo })) };
        } else {
            result = { overallRisk: 'safe', results: [], matchedIngredients: ingredients.map(i => ({ original: i.original, standardName: i.nameKo })) };
        }
        localStorage.setItem('analysisResult', JSON.stringify(result));
        router.push('/results');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff', paddingBottom: 80 }}>
            <header style={{ textAlign: 'center', padding: '20px 16px 14px' }}><h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📷 약물 스캔</h1><p style={{ fontSize: 13, color: '#94a3b8' }}>새로 복용할 약을 분석합니다</p></header>
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
                <button onClick={() => setMode('camera')} style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, background: mode === 'camera' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.08)', color: mode === 'camera' ? '#fff' : '#94a3b8' }}>📷 카메라</button>
                <button onClick={() => setMode('search')} style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, background: mode === 'search' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.08)', color: mode === 'search' ? '#fff' : '#94a3b8' }}>🔍 검색</button>
            </div>
            <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
                {mode === 'camera' && (
                    <>
                        {cameraError ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16 }}><span style={{ fontSize: 48, marginBottom: 12 }}>📵</span><p style={{ fontSize: 14, color: '#f87171', marginBottom: 16, whiteSpace: 'pre-line' }}>{cameraError}</p><button onClick={() => fileInputRef.current?.click()} style={{ padding: '14px 24px', background: '#3b82f6', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600 }}>📁 갤러리에서 선택</button></div>
                        ) : cameraActive ? (
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: '#000', borderRadius: 16, overflow: 'hidden' }}>
                                <video ref={videoRef} playsInline muted autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><canvas ref={canvasRef} style={{ display: 'none' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                    <div style={{ position: 'relative', width: '85%', height: '25%', border: '2px solid rgba(59,130,246,0.5)', borderRadius: 8 }}>
                                        <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6', borderTopLeftRadius: 8 }} />
                                        <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '3px solid #3b82f6', borderRight: '3px solid #3b82f6', borderTopRightRadius: 8 }} />
                                        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6', borderBottomLeftRadius: 8 }} />
                                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '3px solid #3b82f6', borderRight: '3px solid #3b82f6', borderBottomRightRadius: 8 }} />
                                    </div>
                                    <p style={{ marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>약 성분명을 프레임 안에 맞춰주세요</p>
                                </div>
                                <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 32 }}>
                                    <button onClick={stopCamera} style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 20 }}>✕</button>
                                    <button onClick={capturePhoto} style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid #fff', background: 'transparent', padding: 4 }}><span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', background: '#fff' }} /></button>
                                    <button onClick={() => fileInputRef.current?.click()} style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 20 }}>📁</button>
                                </div>
                            </div>
                        ) : previewImage ? (
                            <div style={{ borderRadius: 16, overflow: 'hidden' }}><img src={previewImage} alt="Preview" style={{ width: '100%', display: 'block' }} />{ocrLoading && <div style={{ padding: 20, textAlign: 'center' }}>성분 인식 중...</div>}<button onClick={() => { setPreviewImage(null); startCamera(); }} style={{ marginTop: 12, width: '100%', padding: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}>📷 다시 촬영</button></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button onClick={startCamera} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, aspectRatio: '3/4', background: 'rgba(59,130,246,0.08)', border: '2px dashed rgba(59,130,246,0.4)', borderRadius: 16 }}><span style={{ fontSize: 64 }}>📷</span><strong style={{ fontSize: 17, color: '#fff' }}>카메라 시작하기</strong><span style={{ fontSize: 13, color: '#64748b' }}>터치하여 카메라 권한 허용</span></button>
                                <button onClick={() => fileInputRef.current?.click()} style={{ padding: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 12, color: '#94a3b8' }}>📁 갤러리에서 선택</button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </>
                )}
                {mode === 'search' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14 }}><span style={{ fontSize: 18 }}>🔍</span><input type="text" placeholder="약물 또는 성분명 검색..." value={inputValue} onChange={(e) => handleSearch(e.target.value)} style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 16, color: '#fff' }} /></div>
                        {searchResults.length > 0 && <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>{searchResults.map((r) => <button key={r.code} onClick={() => selectIngredient(r)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 16px', background: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: '#fff' }}><span style={{ fontWeight: 600 }}>{r.nameKo}</span><span style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(59,130,246,0.15)', borderRadius: 4, color: '#93c5fd' }}>{r.category}</span></button>)}</div>}
                        <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}><p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>자주 검색되는 성분</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{['아스피린', '와파린', '오메가3'].map(name => <button key={name} onClick={() => handleSearch(name)} style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20, color: '#93c5fd', fontSize: 13 }}>{name}</button>)}</div></div>
                    </div>
                )}
                {ingredients.length > 0 && <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>💊 추가된 성분 ({ingredients.length})</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{ingredients.map((ing) => <span key={ing.original} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(16,185,129,0.15)', borderRadius: 20, fontSize: 14, color: '#6ee7b7' }}>✓ {ing.nameKo}<button onClick={() => setIngredients(p => p.filter(i => i.original !== ing.original))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', color: 'inherit', fontSize: 14 }}>×</button></span>)}</div></div>}
            </div>
            <div style={{ padding: 16 }}><button onClick={handleAnalyze} disabled={ingredients.length === 0 || loading} style={{ width: '100%', padding: 18, background: ingredients.length === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 14, color: ingredients.length === 0 ? '#64748b' : '#fff', fontSize: 17, fontWeight: 700 }}>{loading ? '분석 중...' : `🔍 안전성 분석 ${ingredients.length > 0 ? `(${ingredients.length})` : ''}`}</button></div>
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', zIndex: 100 }}>{[{ href: '/home', icon: '🏠', label: '홈', active: false }, { href: '/scan', icon: '📷', label: '스캔', active: true }, { href: '/products', icon: '💊', label: '약상자', active: false }].map((item) => <Link key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', color: item.active ? '#3b82f6' : '#64748b', fontSize: 11 }}><span style={{ fontSize: 22 }}>{item.icon}</span><span>{item.label}</span></Link>)}</nav>
        </div>
    );
}
