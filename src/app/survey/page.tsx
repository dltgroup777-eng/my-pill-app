'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './survey.module.css';

const ageBands = [
    { value: '20s', label: '20대' },
    { value: '30s', label: '30대' },
    { value: '40s', label: '40대' },
    { value: '50s', label: '50대' },
    { value: '60+', label: '60대 이상' },
];

export default function SurveyPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [ageBand, setAgeBand] = useState('');
    const [liverIssue, setLiverIssue] = useState(false);
    const [kidneyIssue, setKidneyIssue] = useState(false);
    const [bleedingRisk, setBleedingRisk] = useState(false);
    const [pregnancyLactation, setPregnancyLactation] = useState(false);

    const questions = [
        { title: '이름을 알려주세요', type: 'name' },
        { title: '연령대를 선택해주세요', type: 'age' },
        { title: '간 관련 질환이 있으신가요?', type: 'liver' },
        { title: '신장 관련 질환이 있으신가요?', type: 'kidney' },
        { title: '출혈 위험이 있거나 항응고제를 복용중이신가요?', type: 'bleeding' },
        { title: '임신 중이거나 수유 중이신가요?', type: 'pregnancy' },
    ];

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name, ageBand, liverIssue, kidneyIssue, bleedingRisk, pregnancyLactation
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '프로필 저장에 실패했습니다.');
            }

            router.push('/home');
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const renderQuestion = () => {
        const q = questions[step];

        if (q.type === 'name') {
            return (
                <input
                    type="text"
                    className="input"
                    placeholder="이름 입력"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
            );
        }

        if (q.type === 'age') {
            return (
                <div className={styles.options}>
                    {ageBands.map((ab) => (
                        <button
                            key={ab.value}
                            className={`${styles.option} ${ageBand === ab.value ? styles.selected : ''}`}
                            onClick={() => setAgeBand(ab.value)}
                        >
                            {ab.label}
                        </button>
                    ))}
                </div>
            );
        }

        // Boolean questions
        const value = q.type === 'liver' ? liverIssue
            : q.type === 'kidney' ? kidneyIssue
                : q.type === 'bleeding' ? bleedingRisk
                    : pregnancyLactation;

        const setValue = q.type === 'liver' ? setLiverIssue
            : q.type === 'kidney' ? setKidneyIssue
                : q.type === 'bleeding' ? setBleedingRisk
                    : setPregnancyLactation;

        return (
            <div className={styles.options}>
                <button
                    className={`${styles.option} ${value === true ? styles.selected : ''}`}
                    onClick={() => setValue(true)}
                >
                    예
                </button>
                <button
                    className={`${styles.option} ${value === false ? styles.selected : ''}`}
                    onClick={() => setValue(false)}
                >
                    아니오
                </button>
            </div>
        );
    };

    const canProceed = () => {
        if (step === 0) return name.trim().length > 0;
        if (step === 1) return ageBand !== '';
        return true;
    };

    return (
        <div className={styles.container}>
            <div className={styles.progress}>
                <div className={styles.progressBar} style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>{questions[step].title}</h1>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.question}>
                    {renderQuestion()}
                </div>

                <div className={styles.actions}>
                    {step > 0 && (
                        <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                            이전
                        </button>
                    )}
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                    >
                        {step === questions.length - 1 ? (loading ? '저장 중...' : '완료') : '다음'}
                    </button>
                </div>
            </div>
        </div>
    );
}
