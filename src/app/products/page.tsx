'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './products.module.css';

const DEV_MODE = true;
const MOCK_PRODUCTS = [
    { id: '1', name: '쿠마딘 (와파린)', type: 'medicine', dosageText: '1일 1회' },
    { id: '2', name: '오메가3', type: 'supplement', dosageText: '1일 2회' },
    { id: '3', name: '비타민D', type: 'supplement', dosageText: '1일 1회' },
];

interface Product { id: string; name: string; type: string; dosageText?: string; }

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (DEV_MODE) { setProducts(MOCK_PRODUCTS); setLoading(false); return; }
        const token = localStorage.getItem('accessToken');
        if (!token) { window.location.href = '/login'; return; }
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json()).then(data => setProducts(data.products || []))
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleDelete = (id: string) => { if (confirm('정말 삭제하시겠습니까?')) setProducts(prev => prev.filter(p => p.id !== id)); };

    if (loading) return <div className={styles.loading}><div className={styles.spinner}></div></div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}><h1>💊 내 약상자</h1><p>현재 복용 중인 약물을 관리하세요</p></header>
            <div className={styles.content}>
                {products.length === 0 ? (
                    <div className={styles.emptyState}><span className={styles.emptyIcon}>📦</span><h3>약상자가 비어있어요</h3><p>복용 중인 약을 추가해보세요</p><Link href="/scan" className={styles.addBtn}>➕ 약 추가하기</Link></div>
                ) : (
                    <div className={styles.productList}>
                        {products.map((p) => (
                            <div key={p.id} className={styles.productCard}>
                                <div className={styles.productIcon}>{p.type === 'medicine' ? '💊' : '🌿'}</div>
                                <div className={styles.productInfo}><h3>{p.name}</h3><p>{p.dosageText || '복용량 미지정'}</p></div>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>🗑️</button>
                            </div>
                        ))}
                        <Link href="/scan" className={styles.addCardBtn}><span>➕</span><span>약 추가하기</span></Link>
                    </div>
                )}
            </div>
            <nav className={styles.bottomNav}><Link href="/home" className={styles.navItem}><span>🏠</span><span>홈</span></Link><Link href="/scan" className={styles.navItem}><span>📷</span><span>스캔</span></Link><Link href="/products" className={`${styles.navItem} ${styles.active}`}><span>💊</span><span>약상자</span></Link></nav>
        </div>
    );
}
