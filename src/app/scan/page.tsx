'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './scan.module.css';

// ==========================================
// 🧪 개발 테스트 모드 (인증 우회)
// ==========================================
const DEV_MODE = true;

const MOCK_SEARCH_RESULTS = [
    { code: 'ASPIRIN', nameKo: '아스피린', nameEn: 'Aspirin', category: '해열진통제' },
    { code: 'IBUPROFEN', nameKo: '이부프로펜', nameEn: 'Ibuprofen', category: 'NSAID' },
    { code: 'ACETAMINOPHEN', nameKo: '아세트아미노펜', nameEn: 'Acetaminophen', category: '해열진통제' },
    { code: 'WARFARIN', nameKo: '와파린', nameEn: 'Warfarin', category: '항응고제' },
    { code: 'OMEGA3', nameKo: '오메가3', nameEn: 'Omega-3', category: '오메가지방산' },
    { code: 'VITAMIN_D', nameKo: '비타민D', nameEn: 'Vitamin D', category: '비타민' },
    { code: 'GRAPEFRUIT', nameKo: '자몽', nameEn: 'Grapefruit', category: '음식' },
    { code: 'SIMVASTATIN', nameKo: '심바스타틴', nameEn: 'Simvastatin', category: '스타틴' },
    { code: 'GINKGO', nameKo: '은행잎추출물', nameEn: 'Ginkgo', category: '허브보충제' },
    { code: 'CLOPIDOGREL', nameKo: '클로피도그렐', nameEn: 'Clopidogrel', category: '항혈소판제' },
];

const MOCK_ANALYSIS_RESULT = {
    success: true,
    scannedCount: 1,
    matchedCount: 1,
    matchedIngredients: [
        { original: '아스피린', standardCode: 'ASPIRIN', standardName: '아스피린', confidence: 1 }
    ],
    unmatchedIngredients: [],
    overallRisk: 'danger',
    results: [
        {
            ruleId: 'mock-rule-1',
            level: 'danger',
            category: 'ddi',
            triggerIngredient: { code: 'WARFARIN', nameKo: '와파린' },
            targetIngredient: { code: 'ASPIRIN', nameKo: '아스피린' },
            message: {
                conclusion: '🚨 심각한 출혈 위험!',
                reason: '와파린과 아스피린을 함께 복용하면 출혈 위험이 크게 증가합니다. 두 약물 모두 혈액 응고를 억제하여 상승 효과가 발생합니다.',
                action: '즉시 의사 또는 약사와 상담하세요. 자가 조절하지 마세요.',
            },
            evidenceUrl: 'https://www.drugs.com/interactions-check.php',
        },
    ],
    baselineIngredients: ['WARFARIN'],
    processingTime: 42,
};

interface SearchResult {
    code: string;
    nameKo: string;
    nameEn?: string;
    category?: string;
}

interface AddedIngredient {
    code: string;
    nameKo: string;
    original: string;
}

export default function ScanPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    const [mode, setMode] = useState<'camera' | 'search'>('search');
    const [ingredients, setIngredients] = useState<AddedIngredient[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // 카메라 시작
    const startCamera = useCallback(async () => {
        try {
            setCameraError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // 후면 카메라
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraActive(true);
            }
        } catch (error) {
            console.error('Camera error:', error);
            setCameraError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
        }
    }, []);

    // 카메라 중지
    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    }, []);

    // 사진 촬영
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(imageData);
        stopCamera();
        processImage(imageData);
    }, [stopCamera]);

    // 이미지 처리 (OCR)
    const processImage = async (imageData: string) => {
        setOcrLoading(true);

        if (DEV_MODE) {
            setTimeout(() => {
                setIngredients([
                    { code: 'ASPIRIN', nameKo: '아스피린', original: '아스피린 500mg' },
                ]);
                setOcrLoading(false);
            }, 2000);
            return;
        }

        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('kor+eng');
            const { data: { text } } = await worker.recognize(imageData);
            await worker.terminate();

            // API로 성분 분석
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text, mode: 'text' }),
            });

            const data = await res.json();

            if (data.matchedIngredients?.length > 0) {
                const newIngredients = data.matchedIngredients.map((m: { standardCode: string; standardName: string; original: string }) => ({
                    code: m.standardCode,
                    nameKo: m.standardName,
                    original: m.original,
                }));
                setIngredients(prev => [...prev, ...newIngredients.filter((n: { code: string }) => !prev.find(p => p.code === n.code))]);
            }
        } catch (error) {
            console.error('OCR error:', error);
        } finally {
            setOcrLoading(false);
        }
    };

    // 파일 업로드
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const imageData = ev.target?.result as string;
            setPreviewImage(imageData);
            processImage(imageData);
        };
        reader.readAsDataURL(file);
    };

    // 자동완성 검색
    const handleSearch = useCallback(async (query: string) => {
        if (query.length < 1) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        if (DEV_MODE) {
            const filtered = MOCK_SEARCH_RESULTS.filter(r =>
                r.nameKo.includes(query) ||
                r.nameEn?.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
            setShowResults(true);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/scan?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            setSearchResults(data.results || []);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        }
    }, []);

    const onInputChange = (value: string) => {
        setInputValue(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => handleSearch(value), 300);
    };

    const selectIngredient = (result: SearchResult) => {
        if (!ingredients.find(i => i.code === result.code)) {
            setIngredients(prev => [...prev, {
                code: result.code,
                nameKo: result.nameKo,
                original: result.nameKo,
            }]);
        }
        setInputValue('');
        setSearchResults([]);
        setShowResults(false);
    };

    const addManualIngredient = () => {
        if (inputValue.trim() && !ingredients.find(i => i.original === inputValue.trim())) {
            setIngredients(prev => [...prev, {
                code: '',
                nameKo: inputValue.trim(),
                original: inputValue.trim(),
            }]);
            setInputValue('');
            setShowResults(false);
        }
    };

    const removeIngredient = (original: string) => {
        setIngredients(prev => prev.filter(i => i.original !== original));
    };

    // 분석 실행
    const handleAnalyze = async () => {
        if (ingredients.length === 0) {
            alert('분석할 성분을 추가해주세요.');
            return;
        }

        setLoading(true);

        if (DEV_MODE) {
            setTimeout(() => {
                const hasAspirin = ingredients.some(i => i.code === 'ASPIRIN' || i.nameKo.includes('아스피린'));

                if (hasAspirin) {
                    localStorage.setItem('analysisResult', JSON.stringify(MOCK_ANALYSIS_RESULT));
                } else {
                    localStorage.setItem('analysisResult', JSON.stringify({
                        ...MOCK_ANALYSIS_RESULT,
                        overallRisk: 'notice',
                        results: [],
                        matchedIngredients: ingredients.map(i => ({ original: i.original, standardName: i.nameKo })),
                    }));
                }
                router.push('/results');
                setLoading(false);
            }, 1000);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ingredients: ingredients.map(i => i.nameKo),
                    mode: 'ingredients',
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('analysisResult', JSON.stringify(data));
            router.push('/results');
        } catch (error) {
            console.error('Analysis error:', error);
            alert('분석 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모드 변경 시 카메라 정리
    useEffect(() => {
        if (mode !== 'camera') {
            stopCamera();
        }
        return () => stopCamera();
    }, [mode, stopCamera]);

    return (
        <div className={styles.container}>
            {/* 개발 모드 배너 */}
            {DEV_MODE && (
                <div className={styles.devBanner}>
                    🧪 개발 모드 - "아스피린" 추가 시 위험 알림 테스트!
                </div>
            )}

            {/* 헤더 */}
            <header className={styles.header}>
                <h1>📷 약물 스캔</h1>
                <p>새로 복용할 약을 분석합니다</p>
            </header>

            {/* 탭 선택 */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${mode === 'camera' ? styles.active : ''}`}
                    onClick={() => setMode('camera')}
                >
                    📷 카메라
                </button>
                <button
                    className={`${styles.tab} ${mode === 'search' ? styles.active : ''}`}
                    onClick={() => setMode('search')}
                >
                    🔍 검색
                </button>
            </div>

            <div className={styles.content}>
                {/* 카메라 모드 */}
                {mode === 'camera' && (
                    <div className={styles.cameraSection}>
                        {cameraError ? (
                            <div className={styles.cameraError}>
                                <span>📵</span>
                                <p>{cameraError}</p>
                                <button onClick={() => fileInputRef.current?.click()}>
                                    📁 갤러리에서 선택
                                </button>
                            </div>
                        ) : cameraActive ? (
                            <div className={styles.cameraContainer}>
                                <video ref={videoRef} className={styles.video} playsInline muted />

                                {/* 📐 카메라 가이드 프레임 */}
                                <div className={styles.cameraGuide}>
                                    <div className={styles.guideFrame}>
                                        <div className={styles.guideCorner} style={{ top: 0, left: 0 }}></div>
                                        <div className={styles.guideCorner} style={{ top: 0, right: 0 }}></div>
                                        <div className={styles.guideCorner} style={{ bottom: 0, left: 0 }}></div>
                                        <div className={styles.guideCorner} style={{ bottom: 0, right: 0 }}></div>
                                    </div>
                                    <p className={styles.guideText}>성분명을 프레임 안에 맞춰주세요</p>
                                </div>

                                <canvas ref={canvasRef} style={{ display: 'none' }} />

                                <div className={styles.cameraControls}>
                                    <button className={styles.cancelBtn} onClick={stopCamera}>
                                        ✕
                                    </button>
                                    <button className={styles.captureBtn} onClick={capturePhoto}>
                                        <span className={styles.captureBtnInner}></span>
                                    </button>
                                    <button
                                        className={styles.galleryBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        📁
                                    </button>
                                </div>
                            </div>
                        ) : previewImage ? (
                            <div className={styles.previewContainer}>
                                <img src={previewImage} alt="Preview" className={styles.previewImage} />
                                {ocrLoading && (
                                    <div className={styles.ocrOverlay}>
                                        <div className={styles.spinner}></div>
                                        <p>성분 인식 중...</p>
                                    </div>
                                )}
                                <button
                                    className={styles.retakeBtn}
                                    onClick={() => {
                                        setPreviewImage(null);
                                        startCamera();
                                    }}
                                    disabled={ocrLoading}
                                >
                                    📷 다시 촬영
                                </button>
                            </div>
                        ) : (
                            <div className={styles.cameraPlaceholder} onClick={startCamera}>
                                <div className={styles.cameraIconLarge}>📷</div>
                                <p>탭하여 카메라 시작</p>
                                <span>또는 갤러리에서 선택</span>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                            className={styles.hiddenInput}
                        />
                    </div>
                )}

                {/* 검색 모드 */}
                {mode === 'search' && (
                    <div className={styles.searchSection}>
                        <div className={styles.searchBox}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="약물 또는 성분명 검색..."
                                value={inputValue}
                                onChange={(e) => onInputChange(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addManualIngredient()}
                            />
                            {inputValue && (
                                <button className={styles.addButton} onClick={addManualIngredient}>
                                    추가
                                </button>
                            )}
                        </div>

                        {showResults && searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map((result) => (
                                    <button
                                        key={result.code}
                                        className={styles.searchResultItem}
                                        onClick={() => selectIngredient(result)}
                                    >
                                        <div className={styles.resultMain}>
                                            <span className={styles.resultName}>{result.nameKo}</span>
                                            {result.nameEn && (
                                                <span className={styles.resultNameEn}>{result.nameEn}</span>
                                            )}
                                        </div>
                                        {result.category && (
                                            <span className={styles.resultCategory}>{result.category}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 빠른 선택 */}
                        <div className={styles.quickSelect}>
                            <p>자주 검색되는 성분</p>
                            <div className={styles.quickButtons}>
                                {['아스피린', '타이레놀', '이부프로펜', '오메가3', '비타민D'].map(name => (
                                    <button
                                        key={name}
                                        className={styles.quickButton}
                                        onClick={() => onInputChange(name)}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 추가된 성분 */}
                {ingredients.length > 0 && (
                    <div className={styles.ingredientList}>
                        <h3>💊 추가된 성분 ({ingredients.length})</h3>
                        <div className={styles.tags}>
                            {ingredients.map((ing) => (
                                <span
                                    key={ing.original}
                                    className={`${styles.tag} ${ing.code ? styles.matched : styles.unmatched}`}
                                >
                                    {ing.code ? '✓' : '?'} {ing.nameKo}
                                    <button onClick={() => removeIngredient(ing.original)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 분석 버튼 */}
            <div className={styles.bottomActions}>
                <button
                    className={`${styles.analyzeButton} ${ingredients.length === 0 ? styles.disabled : ''}`}
                    onClick={handleAnalyze}
                    disabled={ingredients.length === 0 || loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.buttonSpinner}></span>
                            분석 중...
                        </>
                    ) : (
                        <>
                            🔍 안전성 분석
                            {ingredients.length > 0 && <span className={styles.badge}>{ingredients.length}</span>}
                        </>
                    )}
                </button>
            </div>

            {/* 하단 네비게이션 */}
            <nav className={styles.bottomNav}>
                <a href="/home" className={styles.navItem}>
                    <span>🏠</span>
                    <span>홈</span>
                </a>
                <a href="/scan" className={`${styles.navItem} ${styles.active}`}>
                    <span>📷</span>
                    <span>스캔</span>
                </a>
                <a href="/products" className={styles.navItem}>
                    <span>💊</span>
                    <span>약상자</span>
                </a>
            </nav>
        </div>
    );
}
