'use client';
import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>
                        💊 복용약 관리<br />
                        <span className={styles.highlight}>에이전트</span>
                    </h1>
                    <p className={styles.subtitle}>
                        약과 영양제 조합을 <strong>10초 내</strong> 분석하여<br />
                        안전한 복용을 도와드립니다
                    </p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🔍</span>
                            <span>중복 성분 검사</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>⚠️</span>
                            <span>상호작용 분석</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>📊</span>
                            <span>개인 맞춤 평가</span>
                        </div>
                    </div>

                    <div className={styles.cta}>
                        <Link href="/register" className="btn btn-primary btn-lg">
                            무료로 시작하기
                        </Link>
                        <Link href="/login" className="btn btn-secondary btn-lg">
                            로그인
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className={styles.howItWorks}>
                <h2>어떻게 사용하나요?</h2>
                <div className={styles.steps}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>1</div>
                        <h3>복용 중인 약 등록</h3>
                        <p>사진 촬영, 검색, 또는 직접 입력</p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>2</div>
                        <h3>건강 정보 입력</h3>
                        <p>간단한 5가지 질문</p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>3</div>
                        <h3>결과 확인</h3>
                        <p>위험도와 행동 지침 제공</p>
                    </div>
                </div>
            </section>

            {/* Risk levels explanation */}
            <section className={styles.riskLevels}>
                <h2>분석 결과 안내</h2>
                <div className="risk-card notice">
                    <strong>📢 참고</strong>
                    <p>알아두면 좋은 정보입니다.</p>
                </div>
                <div className="risk-card warning">
                    <strong>⚠️ 주의</strong>
                    <p>의사·약사와 상담을 권장합니다.</p>
                </div>
                <div className="risk-card danger">
                    <strong>🚨 위험</strong>
                    <p>즉시 전문가 상담이 필요합니다.</p>
                </div>
            </section>
        </div>
    );
}
