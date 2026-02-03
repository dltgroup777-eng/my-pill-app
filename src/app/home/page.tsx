'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const MOCK_PRODUCTS = [{ id: '1', name: '쿠마딘 (와파린)', type: 'medicine' }, { id: '2', name: '오메가3', type: 'supplement' }];

export default function HomePage() {
    const [userName, setUserName] = useState('사용자');
    const [products, setProducts] = useState(MOCK_PRODUCTS);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserName(JSON.parse(user).name || '사용자');
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff', paddingBottom: 80 }}>
            <header style={{ padding: '20px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>안녕하세요 👋</h1><p style={{ fontSize: 14, color: '#94a3b8' }}>{userName}님, 오늘도 건강하세요!</p></div>
                    <Link href="/profile" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 20 }}>👤</Link>
                </div>
            </header>

            <section style={{ padding: '0 16px', marginBottom: 20 }}>
                <Link href="/scan" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 16, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: 14, fontSize: 26 }}>📷</div>
                        <div><h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>약물 안전 스캔</h2><p style={{ fontSize: 13, opacity: 0.9 }}>새로 먹을 약의 안전성을 확인하세요</p></div>
                    </div>
                    <span style={{ fontSize: 22, opacity: 0.8 }}>→</span>
                </Link>
            </section>

            <section style={{ padding: '0 16px', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[{ href: '/scan', icon: '📷', label: '사진 스캔' }, { href: '/products/add', icon: '➕', label: '약 추가' }, { href: '/products', icon: '💊', label: '내 약상자' }, { href: '/results', icon: '📊', label: '분석 결과' }].map((item) => (
                        <Link key={item.href} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                            <span style={{ fontSize: 24 }}>{item.icon}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {products.length > 0 && (
                <section style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>💊 복용 중인 약</h3><Link href="/products" style={{ fontSize: 12, color: '#3b82f6' }}>전체보기</Link></div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {products.slice(0, 3).map((p) => <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 13, color: '#e2e8f0' }}>{p.type === 'medicine' ? '💊' : '🌿'} {p.name}</span>)}
                        {products.length > 3 && <span style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.15)', borderRadius: 20, fontSize: 13, color: '#93c5fd' }}>+{products.length - 3}</span>}
                    </div>
                </section>
            )}

            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', zIndex: 100 }}>
                {[{ href: '/home', icon: '🏠', label: '홈', active: true }, { href: '/scan', icon: '📷', label: '스캔' }, { href: '/products', icon: '💊', label: '약상자' }].map((item) => (
                    <Link key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', color: item.active ? '#3b82f6' : '#64748b', fontSize: 11 }}>
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
