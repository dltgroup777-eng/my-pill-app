'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; isGuest: boolean } | null>(null);

    useEffect(() => { const saved = localStorage.getItem('user'); if (saved) { try { setUser(JSON.parse(saved)); } catch { } } }, []);

    const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff' }}>
            <header style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}><Link href="/home" style={{ color: '#94a3b8', fontSize: 15 }}>← 뒤로</Link><h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>👤 프로필</h1></header>
            <section style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 20 }}><div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '50%', fontSize: 28 }}>👤</div><div><h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.name || '사용자'}</h2><p style={{ fontSize: 14, color: '#94a3b8' }}>{user?.email || ''}</p>{user?.isGuest && <span style={{ display: 'inline-block', marginTop: 4, padding: '4px 8px', background: 'rgba(249,115,22,0.2)', borderRadius: 4, fontSize: 12, color: '#fdba74' }}>게스트 계정</span>}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>{[{ label: '건강 프로필 설정', icon: '❤️' }, { label: '알림 설정', icon: '🔔' }, { label: '앱 정보', icon: 'ℹ️' }].map((item, i) => <button key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', color: '#fff', textAlign: 'left' }}><span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 20 }}>{item.icon}</span><span style={{ fontSize: 15 }}>{item.label}</span></span><span style={{ color: '#64748b' }}>→</span></button>)}</div>
            </section>
            <div style={{ flex: 1 }} />
            <div style={{ padding: 16, paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}><button onClick={handleLogout} style={{ width: '100%', padding: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, color: '#f87171', fontSize: 15, fontWeight: 600 }}>🚪 로그아웃</button></div>
        </div>
    );
}
