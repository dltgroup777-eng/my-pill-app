'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './add.module.css';

interface SearchResult {
    code: string;
    nameKo: string;
    nameEn?: string;
    category?: string;
}

interface SelectedIngredient {
    code: string;
    nameKo: string;
    originalName: string;
}

export default function AddProductPage() {
    const router = useRouter();
    const debounceRef = useRef<NodeJS.Timeout>();

    const [name, setName] = useState('');
    const [type, setType] = useState<'medicine' | 'supplement'>('supplement');
    const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    // 자동완성 검색
    const handleSearch = useCallback(async (query: string) => {
        if (query.length < 1) {
            setSearchResults([]);
            setShowResults(false);
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
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            handleSearch(value);
        }, 300);
    };

    const selectIngredient = (result: SearchResult) => {
        if (!ingredients.find(i => i.code === result.code)) {
            setIngredients(prev => [...prev, {
                code: result.code,
                nameKo: result.nameKo,
                originalName: result.nameKo,
            }]);
        }
        setInputValue('');
        setSearchResults([]);
        setShowResults(false);
    };

    const addManualIngredient = () => {
        if (inputValue.trim() && !ingredients.find(i => i.originalName === inputValue.trim())) {
            setIngredients(prev => [...prev, {
                code: '',
                nameKo: inputValue.trim(),
                originalName: inputValue.trim(),
            }]);
            setInputValue('');
            setShowResults(false);
        }
    };

    const removeIngredient = (originalName: string) => {
        setIngredients(prev => prev.filter(i => i.originalName !== originalName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    type,
                    ingredients: ingredients.map(ing => ({ standardName: ing.nameKo })),
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || '등록 실패');

            alert(data.message || '제품이 등록되었습니다!');
            router.push('/products');
        } catch (error) {
            console.error(error);
            alert('제품 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    ← 뒤로
                </button>
                <h1>💊 내 약상자에 추가</h1>
                <p>상시 복용 중인 약/영양제를 등록하세요</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* 제품명 */}
                <div className={styles.field}>
                    <label>제품명 *</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="예: 종합비타민, 타이레놀"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* 종류 선택 */}
                <div className={styles.field}>
                    <label>종류</label>
                    <div className={styles.typeButtons}>
                        <button
                            type="button"
                            className={`${styles.typeBtn} ${type === 'supplement' ? styles.active : ''}`}
                            onClick={() => setType('supplement')}
                        >
                            🌿 영양제/보충제
                        </button>
                        <button
                            type="button"
                            className={`${styles.typeBtn} ${type === 'medicine' ? styles.active : ''}`}
                            onClick={() => setType('medicine')}
                        >
                            💊 의약품
                        </button>
                    </div>
                </div>

                {/* 성분 검색 */}
                <div className={styles.field}>
                    <label>성분 검색</label>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="성분명 검색... (예: 아스피린)"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addManualIngredient())}
                        />
                        {inputValue && (
                            <button
                                type="button"
                                className={styles.addBtn}
                                onClick={addManualIngredient}
                            >
                                추가
                            </button>
                        )}
                    </div>

                    {/* 자동완성 결과 */}
                    {showResults && searchResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {searchResults.map((result) => (
                                <button
                                    key={result.code}
                                    type="button"
                                    className={styles.resultItem}
                                    onClick={() => selectIngredient(result)}
                                >
                                    <div>
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

                    {/* 빠른 추가 버튼 */}
                    <div className={styles.quickAdd}>
                        <p>자주 등록되는 성분:</p>
                        <div className={styles.quickButtons}>
                            {['와파린', '아스피린', '오메가3', '비타민D', '칼슘'].map(name => (
                                <button
                                    key={name}
                                    type="button"
                                    className={styles.quickButton}
                                    onClick={() => onInputChange(name)}
                                >
                                    + {name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 선택된 성분 목록 */}
                {ingredients.length > 0 && (
                    <div className={styles.selectedIngredients}>
                        <label>선택된 성분 ({ingredients.length}개)</label>
                        <div className={styles.tags}>
                            {ingredients.map((ing) => (
                                <span
                                    key={ing.originalName}
                                    className={`${styles.tag} ${ing.code ? styles.matched : styles.unmatched}`}
                                >
                                    {ing.code ? '✓' : '?'} {ing.nameKo}
                                    <button type="button" onClick={() => removeIngredient(ing.originalName)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !name.trim()}
                >
                    {loading ? '등록 중...' : '✓ 내 약상자에 추가'}
                </button>
            </form>

            <div className={styles.hint}>
                💡 <strong>Tip:</strong> 성분을 정확히 등록하면 새로운 약 스캔 시 상호작용을 더 정확히 분석할 수 있어요!
            </div>
        </div>
    );
}
