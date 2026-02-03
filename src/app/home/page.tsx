'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './home.module.css';

// ==========================================
// 🧪 개발 테스트 모드
// ==========================================
const DEV_MODE = true;

const MOCK_PRODUCTS = [
    { id: '1', name: '쿠마딘 (와파린)', type: 'medicine' },
    { id: '2', name: '오메가3 피쉬오일', type: 'supplement' },
    { id: '3', name: '비타민D 1000IU', type: 'supplement' },
];

interface Product {
    id: string;
    name: string;
    type: string;
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('테스트');
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    // PWA 설치 프롬프트 처리
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // 데이터 로드
    useEffect(() => {
        if (DEV_MODE) {
            setProducts(MOCK_PRODUCTS);
            setUserName('테스트');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        Promise.all([
            fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
        ])
            .then(async ([profileRes, productsRes]) => {
                const profileData = await profileRes.json();
                const productsData = await productsRes.json();
                setUserName(profileData.profile?.name || '사용자');
                setProducts(productsData.products || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setDeferredPrompt(null);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* 개발 모드 배너 */}
            {DEV_MODE && (
                <div className={styles.devBanner}>
                    🧪 개발 모드 - 인증 우회됨
                </div>
            )}

            {/* PWA 설치 배너 */}
            {showInstallBanner && (
                <div className={styles.installBanner}>
                    <div className={styles.installContent}>
                        <span className={styles.installIcon}>📱</span>
                        <div>
                            <strong>홈 화면에 추가</strong>
                            <p>앱처럼 빠르게 사용하세요</p>
                        </div>
                    </div>
                    <div className={styles.installActions}>
                        <button onClick={() => setShowInstallBanner(false)}>나중에</button>
                        <button className={styles.installBtn} onClick={handleInstall}>설치</button>
                    </div>
                </div>
            )}

            {/* 헤더 */}
            <header className={styles.header}>
                <div className={styles.greeting}>
                    <span className={styles.wave}>👋</span>
                    <div>
                        <h1>안녕하세요, {userName}님</h1>
                        <p>오늘도 건강한 하루 되세요!</p>
                    </div>
                </div>
            </header>

            {/* 메인 액션 */}
            <section className={styles.mainAction}>
                <Link href="/scan" className={styles.scanCard}>
                    <div className={styles.scanIcon}>📷</div>
                    <div className={styles.scanContent}>
                        <h2>약물 안전 스캔</h2>
                        <p>새로 먹을 약이나 영양제를 스캔하세요</p>
                    </div>
                    <span className={styles.arrow}>→</span>
                </Link>
            </section>

            {/* 내 약상자 미리보기 */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>💊 내 약상자</h2>
                    <Link href="/products" className={styles.seeAll}>전체보기</Link>
                </div>

                {products.length === 0 ? (
                    <div className={styles.empty}>
                        <p>등록된 약이 없습니다</p>
                        <Link href="/products/add" className={styles.addLink}>
                            + 약 등록하기
                        </Link>
                    </div>
                ) : (
                    <div className={styles.productGrid}>
                        {products.slice(0, 4).map((product) => (
                            <div key={product.id} className={styles.productCard}>
                                <span className={styles.productIcon}>
                                    {product.type === 'medicine' ? '💊' : '🌿'}
                                </span>
                                <span className={styles.productName}>{product.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 빠른 기능 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>⚡ 빠른 기능</h2>
                <div className={styles.quickActions}>
                    <Link href="/scan" className={styles.quickCard}>
                        <span>📷</span>
                        <span>사진 스캔</span>
                    </Link>
                    <Link href="/products/add" className={styles.quickCard}>
                        <span>➕</span>
                        <span>약 추가</span>
                    </Link>
                    <Link href="/results" className={styles.quickCard}>
                        <span>📊</span>
                        <span>분석 결과</span>
                    </Link>
                </div>
            </section>

            {/* 하단 네비게이션 */}
            <nav className={styles.bottomNav}>
                <Link href="/home" className={`${styles.navItem} ${styles.active}`}>
                    <span>🏠</span>
                    <span>홈</span>
                </Link>
                <Link href="/scan" className={styles.navItem}>
                    <span>📷</span>
                    <span>스캔</span>
                </Link>
                <Link href="/products" className={styles.navItem}>
                    <span>💊</span>
                    <span>약상자</span>
                </Link>
            </nav>
        </div>
    );
}

// PWA 설치 프롬프트 타입
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
