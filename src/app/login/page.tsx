'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

const DEV_MODE = true;

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useState(() => {
        if (typeof window !== 'undefined' && window.PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
                .then(available => setBiometricAvailable(available))
                .catch(() => { });
        }
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (DEV_MODE) {
            if (email && password.length >= 4) {
                localStorage.setItem('accessToken', 'dev-mock-token');
                localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
                router.push('/home');
                return;
            }
            setError('이메일과 비밀번호를 입력해주세요 (4자 이상)');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            localStorage.setItem('accessToken', data.accessToken);
            router.push('/home');
        } catch (err) {
            setError(err instanceof Error ? err.message : '로그인 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        if (DEV_MODE) {
            localStorage.setItem('accessToken', 'dev-biometric-token');
            localStorage.setItem('user', JSON.stringify({ email: 'bio@user.com', name: '생체인증' }));
            router.push('/home');
        }
    };

    const handleSkipLogin = () => {
        localStorage.setItem('accessToken', 'dev-skip-token');
        localStorage.setItem('user', JSON.stringify({ email: 'guest@test.com', name: '게스트' }));
        router.push('/home');
    };

    return (
        <div className={styles.container}>
            {DEV_MODE && <div className={styles.devBanner}>🧪 개발 모드 - DB 연결 없이 테스트 가능</div>}
            <div className={styles.content}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>💊</span>
                    <h1>약안전</h1>
                    <p>약물 상호작용 분석 서비스</p>
                </div>
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">이메일</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <div className={styles.passwordWrapper}>
                            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" required />
                            <button type="button" className={styles.showPasswordBtn} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
                        </div>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.loginButton} disabled={loading}>{loading ? '로그인 중...' : '로그인'}</button>
                </form>
                {biometricAvailable && <button type="button" className={styles.biometricButton} onClick={handleBiometricLogin}><span>🔐</span> 생체인식으로 로그인</button>}
                {DEV_MODE && <button type="button" className={styles.skipButton} onClick={handleSkipLogin}>⏩ 로그인 건너뛰기 (게스트)</button>}
                <div className={styles.footer}><p>계정이 없으신가요?</p><Link href="/register" className={styles.registerLink}>회원가입</Link></div>
                {DEV_MODE && <div className={styles.testAccount}><p>테스트 계정</p><code>test@test.com / test1234</code></div>}
            </div>
        </div>
    );
}
