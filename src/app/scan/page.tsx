'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './scan.module.css';

const DEV_MODE = true;
const MOCK_SEARCH_RESULTS = [
    { code: 'ASPIRIN', nameKo: '아스피린', nameEn: 'Aspirin', category: '해열진통제' },
    { code: 'IBUPROFEN', nameKo: '이부프로펜', nameEn: 'Ibuprofen', category: 'NSAID' },
    { code: 'ACETAMINOPHEN', nameKo: '아세트아미노펜', nameEn: 'Acetaminophen', category: '해열진통제' },
    { code: 'WARFARIN', nameKo: '와파린', nameEn: 'Warfarin', category: '항응고제' },
    { code: 'OMEGA3', nameKo: '오메가3', nameEn: 'Omega-3', category: '오메가지방산' },
    { code: 'VITAMIN_D', nameKo: '비타민D', nameEn: 'Vitamin D', category: '비타민' },
];
const MOCK_ANALYSIS_RESULT = { success: true, overallRisk: 'danger', results: [{ ruleId: 'rule-warfarin-aspirin', level: 'danger', category: 'ddi', triggerIngredient: { code: 'WARFARIN', nameKo: '와파린' }, targetIngredient: { code: 'ASPIRIN', nameKo: '아스피린' }, message: { conclusion: '심각한 출혈 위험 증가', reason: '두 약물 모두 혈액 응고를 억제하여 상승 효과 발생', action: '즉시 의사 또는 약사와 상담하세요' } }], matchedIngredients: [{ original: '아스피린', standardName: '아스피린' }], baselineIngredients: ['WARFARIN'], processingTime: 127 };

interface SearchResult { code: string; nameKo: string; nameEn?: string; category?: string; }
interface AddedIngredient { code: string; nameKo: string; original: string; }

export default function ScanPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();
    const streamRef = useRef<MediaStream | null>(null);

    const [mode, setMode] = useState<'camera' | 'search'>('search');
    const [ingredients, setIngredients] = useState<AddedIngredient[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

    useEffect(() => { if (typeof navigator !== 'undefined' && navigator.permissions) { navigator.permissions.query({ name: 'camera' as PermissionName }).then(status => { setPermissionState(status.state as 'prompt' | 'granted' | 'denied'); status.onchange = () => setPermissionState(status.state as 'prompt' | 'granted' | 'denied'); }).catch(() => { }); } }, []);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.setAttribute('playsinline', 'true'); await videoRef.current.play(); setCameraActive(true); setPermissionState('granted'); }
        } catch (err) {
            const error = err as Error;
            if (error.name === 'NotAllowedError') { setCameraError('카메라 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.'); setPermissionState('denied'); }
            else if (error.name === 'NotFoundError') setCameraError('카메라를 찾을 수 없습니다.');
            else setCameraError('카메라를 시작할 수 없습니다. 갤러리에서 이미지를 선택해주세요.');
        }
    }, []);

    const stopCamera = useCallback(() => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } if (videoRef.current) videoRef.current.srcObject = null; setCameraActive(false); }, []);
    useEffect(() => { if (mode !== 'camera') stopCamera(); return () => stopCamera(); }, [mode, stopCamera]);

    const capturePhoto = () => { if (!videoRef.current || !canvasRef.current) return; const video = videoRef.current; const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); if (!ctx) return; canvas.width = video.videoWidth; canvas.height = video.videoHeight; ctx.drawImage(video, 0, 0); const imageData = canvas.toDataURL('image/jpeg', 0.9); setPreviewImage(imageData); stopCamera(); processImage(imageData); };

    const processImage = async (imageData: string) => { setOcrLoading(true); if (DEV_MODE) { setTimeout(() => { setIngredients([{ code: 'ASPIRIN', nameKo: '아스피린', original: '아스피린 500mg' }]); setOcrLoading(false); }, 2000); return; } setOcrLoading(false); };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const imageData = ev.target?.result as string; setPreviewImage(imageData); processImage(imageData); }; reader.readAsDataURL(file); };

    const handleSearch = useCallback((query: string) => { if (query.length < 1) { setSearchResults([]); setShowResults(false); return; } const filtered = MOCK_SEARCH_RESULTS.filter(r => r.nameKo.includes(query) || r.nameEn?.toLowerCase().includes(query.toLowerCase())); setSearchResults(filtered); setShowResults(true); }, []);

    const onInputChange = (value: string) => { setInputValue(value); if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => handleSearch(value), 300); };
    const selectIngredient = (result: SearchResult) => { if (!ingredients.find(i => i.code === result.code)) setIngredients(prev => [...prev, { code: result.code, nameKo: result.nameKo, original: result.nameKo }]); setInputValue(''); setSearchResults([]); setShowResults(false); };
    const removeIngredient = (original: string) => setIngredients(prev => prev.filter(i => i.original !== original));

    const handleAnalyze = async () => { if (ingredients.length === 0) return; setLoading(true); if (DEV_MODE) { setTimeout(() => { const hasAspirin = ingredients.some(i => i.code === 'ASPIRIN'); if (hasAspirin) localStorage.setItem('analysisResult', JSON.stringify(MOCK_ANALYSIS_RESULT)); else localStorage.setItem('analysisResult', JSON.stringify({ ...MOCK_ANALYSIS_RESULT, overallRisk: 'notice', results: [], matchedIngredients: ingredients.map(i => ({ original: i.original, standardName: i.nameKo })) })); router.push('/results'); }, 1000); return; } setLoading(false); };

    return (
        <div className={styles.container}>
            <header className={styles.header}><h1>📷 약물 스캔</h1><p>새로 복용할 약을 분석합니다</p></header>
            <div className={styles.tabs}><button className={`${styles.tab} ${mode === 'camera' ? styles.active : ''}`} onClick={() => setMode('camera')}>📷 카메라</button><button className={`${styles.tab} ${mode === 'search' ? styles.active : ''}`} onClick={() => setMode('search')}>🔍 검색</button></div>
            <div className={styles.content}>
                {mode === 'camera' && <div className={styles.cameraSection}>
                    {cameraError ? <div className={styles.cameraError}><span className={styles.errorIcon}>📵</span><p>{cameraError}</p>{permissionState === 'denied' && <div className={styles.permissionGuide}><p>권한 설정 방법:</p><ol><li>브라우저 주소창 왼쪽 🔒 아이콘 터치</li><li>카메라 권한 허용으로 변경</li><li>페이지 새로고침</li></ol></div>}<button onClick={() => fileInputRef.current?.click()} className={styles.galleryBtn}>📁 갤러리에서 선택</button></div>
                        : cameraActive ? <div className={styles.cameraContainer}><video ref={videoRef} className={styles.video} playsInline muted autoPlay /><canvas ref={canvasRef} style={{ display: 'none' }} /><div className={styles.cameraGuide}><div className={styles.guideFrame}><div className={styles.corner} data-pos="tl"></div><div className={styles.corner} data-pos="tr"></div><div className={styles.corner} data-pos="bl"></div><div className={styles.corner} data-pos="br"></div></div><p className={styles.guideText}>약 성분명을 프레임 안에 맞춰주세요</p></div><div className={styles.cameraControls}><button className={styles.controlBtn} onClick={stopCamera}>✕</button><button className={styles.captureBtn} onClick={capturePhoto}><span></span></button><button className={styles.controlBtn} onClick={() => fileInputRef.current?.click()}>📁</button></div></div>
                            : previewImage ? <div className={styles.previewContainer}><img src={previewImage} alt="Preview" className={styles.previewImage} />{ocrLoading && <div className={styles.ocrOverlay}><div className={styles.spinner}></div><p>성분 인식 중...</p></div>}<button className={styles.retakeBtn} onClick={() => { setPreviewImage(null); startCamera(); }} disabled={ocrLoading}>📷 다시 촬영</button></div>
                                : <div className={styles.cameraPlaceholder}><button className={styles.startCameraBtn} onClick={startCamera}><span className={styles.cameraIconLarge}>📷</span><strong>카메라 시작하기</strong><span>터치하여 카메라 권한 허용</span></button><button className={styles.galleryOption} onClick={() => fileInputRef.current?.click()}>📁 갤러리에서 선택</button></div>}
                    <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className={styles.hiddenInput} />
                </div>}
                {mode === 'search' && <div className={styles.searchSection}><div className={styles.searchBox}><span className={styles.searchIcon}>🔍</span><input type="text" className={styles.searchInput} placeholder="약물 또는 성분명 검색..." value={inputValue} onChange={(e) => onInputChange(e.target.value)} /></div>{showResults && searchResults.length > 0 && <div className={styles.searchResults}>{searchResults.map((r) => <button key={r.code} className={styles.resultItem} onClick={() => selectIngredient(r)}><div className={styles.resultMain}><span className={styles.resultName}>{r.nameKo}</span><span className={styles.resultNameEn}>{r.nameEn}</span></div><span className={styles.resultCategory}>{r.category}</span></button>)}</div>}<div className={styles.quickSelect}><p>자주 검색되는 성분</p><div className={styles.quickBtns}>{['아스피린', '타이레놀', '이부프로펜', '오메가3', '비타민D'].map(name => <button key={name} onClick={() => onInputChange(name)}>{name}</button>)}</div></div></div>}
                {ingredients.length > 0 && <div className={styles.ingredientList}><h3>💊 추가된 성분 ({ingredients.length})</h3><div className={styles.tags}>{ingredients.map((ing) => <span key={ing.original} className={`${styles.tag} ${ing.code ? styles.matched : ''}`}>{ing.code ? '✓' : '?'} {ing.nameKo}<button onClick={() => removeIngredient(ing.original)}>×</button></span>)}</div></div>}
            </div>
            <div className={styles.bottomActions}><button className={`${styles.analyzeBtn} ${ingredients.length === 0 ? styles.disabled : ''}`} onClick={handleAnalyze} disabled={ingredients.length === 0 || loading}>{loading ? '분석 중...' : `🔍 안전성 분석 ${ingredients.length > 0 ? `(${ingredients.length})` : ''}`}</button></div>
            <nav className={styles.bottomNav}><Link href="/home" className={styles.navItem}><span>🏠</span><span>홈</span></Link><Link href="/scan" className={`${styles.navItem} ${styles.active}`}><span>📷</span><span>스캔</span></Link><Link href="/products" className={styles.navItem}><span>💊</span><span>약상자</span></Link></nav>
        </div>
    );
}
