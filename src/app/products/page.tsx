'use client';
import { useState } from 'react';
import Link from 'next/link';

const MOCK_PRODUCTS = [
    { id: '1', name: '쿠마딘 (와파린)', type: 'medicine', dosageText: '1일 1회, 5mg', ingredients: ['와파린'] },
    { id: '2', name: '오메가3', type: 'supplement', dosageText: '1일 2회', ingredients: ['오메가3', 'EPA', 'DHA'] },
];

export default function ProductsPage() {
    const [products, setProducts] = useState(MOCK_PRODUCTS);

    const handleDelete = (id: string) => {
        if (confirm('이 약물을 삭제하시겠습니까?')) setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff', paddingBottom: 100 }}>
            <header style={{ padding: '20px 16px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>💊 내 약상자</h1>
                    <Link href="/products/add" style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff' }}>+ 추가</Link>
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>현재 복용 중인 약물 {products.length}개</p>
            </header>

            <section style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
                {products.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                        <span style={{ fontSize: 64, marginBottom: 16 }}>📦</span>
                        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>약상자가 비어있어요</h2>
                        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>복용 중인 약을 등록해주세요</p>
                        <Link href="/products/add" style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#fff' }}>+ 약물 추가하기</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {products.map((product) => (
                            <div key={product.id} style={{ padding: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: product.type === 'medicine' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', borderRadius: 12, fontSize: 24 }}>{product.type === 'medicine' ? '💊' : '🌿'}</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{product.name}</h3>
                                        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{product.dosageText}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {product.ingredients.map((ing, i) => <span key={i} style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: 20, fontSize: 12, color: '#93c5fd' }}>{ing}</span>)}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(product.id)} style={{ padding: 8, color: '#ef4444', fontSize: 18 }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', zIndex: 100 }}>
                {[{ href: '/home', icon: '🏠', label: '홈' }, { href: '/scan', icon: '📷', label: '스캔' }, { href: '/products', icon: '💊', label: '약상자', active: true }].map((item) => (
                    <Link key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0', color: item.active ? '#3b82f6' : '#64748b', fontSize: 11 }}>
                        <span style={{ fontSize: 22 }}>{item.icon}</span><span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
