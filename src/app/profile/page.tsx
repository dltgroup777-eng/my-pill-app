'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './profile.module.css';

interface Profile {
    name: string;
    ageBand: string;
    liverIssue: boolean;
    kidneyIssue: boolean;
    bleedingRisk: boolean;
    pregnancyLactation: boolean;
}

interface User {
    email: string;
    premium: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setProfile(data.profile);
                setUser(data.user);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/');
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;

    const ageBandLabel: Record<string, string> = {
        '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대', '60+': '60대 이상'
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>👤 프로필</h1>
            </header>

            <div className={styles.content}>
                {profile && (
                    <div className={styles.card}>
                        <h2>{profile.name}</h2>
                        {user?.premium && <span className={styles.badge}>PREMIUM</span>}
                        <div className={styles.info}>
                            <p><strong>연령대:</strong> {ageBandLabel[profile.ageBand] || profile.ageBand}</p>
                            <p><strong>이메일:</strong> {user?.email}</p>
                        </div>
                        <div className={styles.conditions}>
                            <h3>건강 상태</h3>
                            <ul>
                                <li>간 질환: {profile.liverIssue ? '있음' : '없음'}</li>
                                <li>신장 질환: {profile.kidneyIssue ? '있음' : '없음'}</li>
                                <li>출혈 위험: {profile.bleedingRisk ? '있음' : '없음'}</li>
                                <li>임신/수유: {profile.pregnancyLactation ? '해당' : '해당없음'}</li>
                            </ul>
                        </div>
                        <Link href="/survey" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                            건강 정보 수정
                        </Link>
                    </div>
                )}

                {!user?.premium && (
                    <Link href="/premium" className={styles.premiumBanner}>
                        <span>⭐</span>
                        <div>
                            <strong>Premium으로 업그레이드</strong>
                            <p>맞춤 분석, PDF 리포트 등</p>
                        </div>
                    </Link>
                )}

                <button className={styles.logoutBtn} onClick={handleLogout}>
                    로그아웃
                </button>
            </div>

            <nav className={styles.bottomNav}>
                <Link href="/home" className={styles.navItem}><span>🏠</span><span>홈</span></Link>
                <Link href="/products" className={styles.navItem}><span>💊</span><span>복용목록</span></Link>
                <Link href="/scan" className={styles.navItem}><span>📷</span><span>스캔</span></Link>
                <Link href="/profile" className={`${styles.navItem} ${styles.active}`}><span>👤</span><span>프로필</span></Link>
            </nav>
        </div>
    );
}
