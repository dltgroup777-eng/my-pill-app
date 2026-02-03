'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

const DEV_MODE = true;

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
        if (formData.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
        setLoading(true);
        if (DEV_MODE) { setTimeout(() => { alert('✅ 회원가입 완료!'); router.push('/login'); }, 1000); return; }
        try {
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!res.ok) throw new Error((await res.json()).error);
            alert('회원가입이 완료되었습니다!'); router.push('/login');
        } catch (err) { setError(err instanceof Error ? err.message : '회원가입 실패'); } finally { setLoading(false); }
    };

    return (
        <div className={styles.container}>
            {DEV_MODE && <div className={styles.devBanner}>🧪 개발 모드 - 회원가입 시뮬레이션</div>}
            <div className={styles.content}>
                <div className={styles.header}><Link href="/login" className={styles.backButton}>← 뒤로</Link><h1>회원가입</h1><p>약안전 서비스에 가입하세요</p></div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}><label htmlFor="name">이름</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="홍길동" required /></div>
                    <div className={styles.inputGroup}><label htmlFor="email">이메일</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" required /></div>
                    <div className={styles.inputGroup}><label htmlFor="password">비밀번호</label><div className={styles.passwordWrapper}><input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="6자 이상" required /><button type="button" className={styles.showPasswordBtn} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button></div></div>
                    <div className={styles.inputGroup}><label htmlFor="confirmPassword">비밀번호 확인</label><div className={styles.passwordWrapper}><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="비밀번호 재입력" required /><button type="button" className={styles.showPasswordBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '🙈' : '👁️'}</button></div></div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? '가입 중...' : '가입하기'}</button>
                </form>
                <div className={styles.footer}><p>이미 계정이 있으신가요?</p><Link href="/login" className={styles.loginLink}>로그인</Link></div>
            </div>
        </div>
    );
}
