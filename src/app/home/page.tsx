'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './home.module.css';

const DEV_MODE = true;
const MOCK_PRODUCTS = [{ id: '1', name: '쿠마딘 (와파린)', type: 'medicine' }, { id: '2', name: '오메가3', type: 'supplement' }];

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }

export default function HomePage() {
    const [products, setProducts] = useState<{ id: string; name: string; type: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('사용자');
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); setShowInstallBanner(true); };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    useEffect(() => {
        if (DEV_MODE) {
            const user = localStorage.getItem('user');
            if (user) setUserName(JSON.parse(user).name || '사용자');
            setProducts(MOCK_PRODUCTS);
            setLoading(false);
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) { window.location.href = '/login'; return; }
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json()).then(data => setProducts(data.products || []))
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleInstall = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); setShowInstallBanner(false); setDeferredPrompt(null); };

    if (loading) return <div className={styles.loading}><div className={styles.spinner}></div></div>;

    return (
        <div className={styles.container}>
            {showInstallBanner && <div className={styles.installBanner}><div className={styles.installContent}><span>📱</span><div><strong>홈 화면에 추가</strong><p>앱처럼 빠르게 사용!</p></div></div><div className={styles.installActions}><button onClick={() => setShowInstallBanner(false)}>나중에</button><button className={styles.installBtn} onClick={handleInstall}>설치</button></div></div>}
            <header className={styles.header}><div className={styles.headerTop}><div className={styles.greeting}><h1>안녕하세요 👋</h1><p>{userName}님, 오늘도 건강하세요!</p></div><Link href="/profile" className={styles.profileBtn}>👤</Link></div></header>
            <section className={styles.mainSection}><Link href="/scan" className={styles.mainCard}><div className={styles.mainCardContent}><div className={styles.mainIcon}>📷</div><div className={styles.mainText}><h2>약물 안전 스캔</h2><p>새로 먹을 약의 안전성을 확인하세요</p></div></div><div className={styles.mainArrow}>→</div></Link></section>
            <section className={styles.quickSection}><div className={styles.quickGrid}><Link href="/scan" className={styles.quickItem}><span className={styles.quickIcon}>📷</span><span>사진 스캔</span></Link><Link href="/products/add" className={styles.quickItem}><span className={styles.quickIcon}>➕</span><span>약 추가</span></Link><Link href="/products" className={styles.quickItem}><span className={styles.quickIcon}>💊</span><span>내 약상자</span></Link><Link href="/results" className={styles.quickItem}><span className={styles.quickIcon}>📊</span><span>분석 결과</span></Link></div></section>
            {products.length > 0 && <section className={styles.productsSection}><div className={styles.sectionHeader}><h3>💊 복용 중인 약</h3><Link href="/products" className={styles.seeAll}>전체보기</Link></div><div className={styles.productChips}>{products.slice(0, 3).map((p) => <span key={p.id} className={styles.productChip}>{p.type === 'medicine' ? '💊' : '🌿'} {p.name}</span>)}{products.length > 3 && <span className={styles.moreChip}>+{products.length - 3}</span>}</div></section>}
            <nav className={styles.bottomNav}><Link href="/home" className={`${styles.navItem} ${styles.active}`}><span>🏠</span><span>홈</span></Link><Link href="/scan" className={styles.navItem}><span>📷</span><span>스캔</span></Link><Link href="/products" className={styles.navItem}><span>💊</span><span>약상자</span></Link></nav>
        </div>
    );
}
