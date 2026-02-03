'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './products.module.css';

// ==========================================
// 🧪 개발 테스트 모드 (인증 우회)
// ==========================================
const DEV_MODE = true; // 🔧 프로덕션에서는 false로 변경!

const MOCK_PRODUCTS = [
    {
        id: '1',
        name: '쿠마딘 (와파린)',
        type: 'medicine',
        createdAt: new Date().toISOString(),
        ingredients: [
            { id: '1', standardCode: 'WARFARIN', standardName: '와파린', category: '항응고제' }
        ],
    },
    {
        id: '2',
        name: '오메가3 피쉬오일',
        type: 'supplement',
        createdAt: new Date().toISOString(),
        ingredients: [
            { id: '2', standardCode: 'OMEGA3', standardName: '오메가3', category: '오메가지방산' }
        ],
    },
    {
        id: '3',
        name: '비타민D 1000IU',
        type: 'supplement',
        createdAt: new Date().toISOString(),
        ingredients: [
            { id: '3', standardCode: 'VITAMIN_D', standardName: '비타민D', category: '비타민' }
        ],
    },
];
// ==========================================

interface Ingredient {
    id: string;
    standardCode: string;
    standardName: string;
    category?: string;
    amount?: number;
    unit?: string;
}

interface Product {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    ingredients: Ingredient[];
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🧪 개발 모드: 목 데이터 사용
        if (DEV_MODE) {
            setProducts(MOCK_PRODUCTS);
            setLoading(false);
            return;
        }

        // 프로덕션 모드: 실제 API 호출
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setProducts(data.products || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [router]);

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        // 🧪 개발 모드: 로컬 상태만 업데이트
        if (DEV_MODE) {
            setProducts(prev => prev.filter(p => p.id !== id));
            return;
        }

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>로딩 중...</p>
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
                    🧪 개발 테스트 모드 (인증 우회됨)
                </div>
            )}

            <header className={styles.header}>
                <div className={styles.headerIcon}>💊</div>
                <h1>내 약상자</h1>
                <p>상시 복용 중인 약과 영양제</p>
            </header>

            <div className={styles.content}>
                {/* 추가 버튼 */}
                <Link href="/products/add" className={styles.addButton}>
                    <span className={styles.addIcon}>+</span>
                    <span>새 제품 추가</span>
                </Link>

                {/* 제품 목록 */}
                {products.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📦</div>
                        <h3>등록된 제품이 없습니다</h3>
                        <p>복용 중인 약이나 영양제를 등록하면<br />새로운 약과의 상호작용을 분석할 수 있어요!</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        <div className={styles.listHeader}>
                            <span>등록된 제품 {products.length}개</span>
                        </div>

                        {products.map(product => (
                            <div key={product.id} className={styles.productCard}>
                                <div className={styles.productMain}>
                                    <span className={styles.productIcon}>
                                        {product.type === 'medicine' ? '💊' : '🌿'}
                                    </span>
                                    <div className={styles.productInfo}>
                                        <h3>{product.name}</h3>
                                        {product.ingredients.length > 0 ? (
                                            <div className={styles.ingredientTags}>
                                                {product.ingredients.slice(0, 3).map((ing) => (
                                                    <span key={ing.id} className={styles.ingredientTag}>
                                                        {ing.standardName}
                                                    </span>
                                                ))}
                                                {product.ingredients.length > 3 && (
                                                    <span className={styles.moreTag}>
                                                        +{product.ingredients.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className={styles.noIngredients}>성분 정보 없음</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(product.id)}
                                    aria-label="삭제"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 하단 내비게이션 */}
            <nav className={styles.bottomNav}>
                <Link href="/home" className={styles.navItem}>
                    <span className={styles.navIcon}>🏠</span>
                    <span className={styles.navLabel}>홈</span>
                </Link>
                <Link href="/products" className={`${styles.navItem} ${styles.active}`}>
                    <span className={styles.navIcon}>💊</span>
                    <span className={styles.navLabel}>약상자</span>
                </Link>
                <Link href="/scan" className={styles.navItem}>
                    <span className={styles.navIcon}>📷</span>
                    <span className={styles.navLabel}>스캔</span>
                </Link>
                <Link href="/profile" className={styles.navItem}>
                    <span className={styles.navIcon}>👤</span>
                    <span className={styles.navLabel}>프로필</span>
                </Link>
            </nav>
        </div>
    );
}
