'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (email && password.length >= 4) {
            localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0], isGuest: false }));
            router.push('/home');
        } else {
            setError('이메일과 비밀번호를 입력해주세요');
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        localStorage.setItem('user', JSON.stringify({ email: 'guest@test.com', name: '게스트', isGuest: true }));
        router.push('/home');
    };

    const handleBiometric = () => {
        if (typeof window !== 'undefined' && window.PublicKeyCredential) {
            localStorage.setItem('user', JSON.stringify({ email: 'bio@user.com', name: '생체인증 사용자', isGuest: false }));
            router.push('/home');
        } else {
            alert('이 기기에서는 생체인식을 지원하지 않습니다.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff' }}>
            <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', color: '#000', padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>🧪 개발 모드 - DB 연결 없이 테스트 가능</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, maxWidth: 400, margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <span style={{ fontSize: 64, display: 'block', marginBottom: 12 }}>💊</span>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>약안전</h1>
                    <p style={{ fontSize: 14, color: '#94a3b8' }}>약물 상호작용 분석 서비스</p>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>이메일</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>비밀번호</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" style={{ width: '100%', padding: 16, paddingRight: 50, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 20, opacity: 0.7 }}>{showPassword ? '🙈' : '👁️'}</button>
                        </div>
                    </div>
                    {error && <p style={{ padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 14, textAlign: 'center' }}>{error}</p>}
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: 18, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 14, color: '#fff', fontSize: 17, fontWeight: 700, opacity: loading ? 0.6 : 1 }}>{loading ? '로그인 중...' : '로그인'}</button>
                </form>
                <button onClick={handleBiometric} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: 16, marginTop: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, color: '#6ee7b7', fontSize: 16, fontWeight: 600 }}>🔐 생체인식으로 로그인</button>
                <button onClick={handleGuestLogin} style={{ width: '100%', padding: 14, marginTop: 8, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12, color: '#94a3b8', fontSize: 15 }}>⏩ 로그인 건너뛰기 (게스트)</button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, fontSize: 14, color: '#64748b' }}><p>계정이 없으신가요?</p><Link href="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>회원가입</Link></div>
                <div style={{ marginTop: 24, padding: 12, background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.3)', borderRadius: 8, textAlign: 'center' }}><p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>테스트 계정</p><code style={{ fontSize: 13, color: '#93c5fd' }}>test@test.com / test1234</code></div>
            </div>
        </div>
    );
}
