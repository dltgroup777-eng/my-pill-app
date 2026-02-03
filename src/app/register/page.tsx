'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
        if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
        setLoading(true);
        setTimeout(() => { alert('✅ 회원가입 완료!'); router.push('/login'); }, 1000);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff' }}>
            <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', color: '#000', padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>🧪 개발 모드 - 회원가입 시뮬레이션</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, maxWidth: 400, margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: 32 }}>
                    <Link href="/login" style={{ display: 'inline-block', marginBottom: 16, color: '#94a3b8', fontSize: 15 }}>← 뒤로</Link>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>회원가입</h1>
                    <p style={{ fontSize: 14, color: '#94a3b8' }}>약안전 서비스에 가입하세요</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>이름</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" required style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} /></div>
                    <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>이메일</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" required style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} /></div>
                    <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>비밀번호</label><div style={{ position: 'relative' }}><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6자 이상" required style={{ width: '100%', padding: 16, paddingRight: 50, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 20, opacity: 0.7 }}>{showPassword ? '🙈' : '👁️'}</button></div></div>
                    <div><label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>비밀번호 확인</label><input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="비밀번호 재입력" required style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} /></div>
                    {error && <p style={{ padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 14, textAlign: 'center' }}>{error}</p>}
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: 18, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 14, color: '#fff', fontSize: 17, fontWeight: 700, opacity: loading ? 0.6 : 1 }}>{loading ? '가입 중...' : '가입하기'}</button>
                </form>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, fontSize: 14, color: '#64748b' }}><p>이미 계정이 있으신가요?</p><Link href="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>로그인</Link></div>
            </div>
        </div>
    );
}
