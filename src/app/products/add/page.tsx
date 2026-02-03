'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MOCK_SEARCH = [
    { code: 'ASPIRIN', nameKo: '아스피린', category: '해열진통제' },
    { code: 'IBUPROFEN', nameKo: '이부프로펜', category: 'NSAID' },
    { code: 'ACETAMINOPHEN', nameKo: '아세트아미노펜', category: '해열진통제' },
    { code: 'OMEGA3', nameKo: '오메가3', category: '오메가지방산' },
    { code: 'VITAMIN_D', nameKo: '비타민 D', category: '비타민' },
];

export default function AddProductPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', type: 'medicine', dosageText: '' });
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH>([]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length < 1) { setSearchResults([]); return; }
        setSearchResults(MOCK_SEARCH.filter(r => r.nameKo.includes(query)));
    };

    const addIngredient = (name: string) => {
        if (!ingredients.includes(name)) setIngredients(prev => [...prev, name]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        alert('✅ 약물이 추가되었습니다!');
        router.push('/products');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a1628 0%, #1a2744 100%)', color: '#fff' }}>
            <header style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Link href="/products" style={{ color: '#94a3b8', fontSize: 15 }}>← 뒤로</Link>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>➕ 약물 추가</h1>
            </header>

            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 20 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>약물 이름 *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 타이레놀, 오메가3" required style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>종류</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[{ value: 'medicine', label: '💊 의약품' }, { value: 'supplement', label: '🌿 영양제' }].map(opt => (
                            <button key={opt.value} type="button" onClick={() => setForm({ ...form, type: opt.value })} style={{ flex: 1, padding: 14, background: form.type === opt.value ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.08)', border: form.type === opt.value ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600 }}>{opt.label}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>복용법</label>
                    <input type="text" value={form.dosageText} onChange={(e) => setForm({ ...form, dosageText: e.target.value })} placeholder="예: 1일 2회, 식후 1정" style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>성분 추가</label>
                    <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="성분명 검색..." style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 16, color: '#fff', outline: 'none' }} />
                    {searchResults.length > 0 && (
                        <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                            {searchResults.map(r => <button key={r.code} type="button" onClick={() => addIngredient(r.nameKo)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: 14, background: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#fff', textAlign: 'left' }}><span>{r.nameKo}</span><span style={{ fontSize: 12, color: '#64748b' }}>{r.category}</span></button>)}
                        </div>
                    )}
                    {ingredients.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                            {ingredients.map((ing, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(16,185,129,0.15)', borderRadius: 20, fontSize: 14, color: '#6ee7b7' }}>✓ {ing}<button type="button" onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} style={{ width: 18, height: 18, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', color: 'inherit', fontSize: 14 }}>×</button></span>)}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }} />

                <button type="submit" style={{ width: '100%', padding: 18, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 14, color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 'max(16px, env(safe-area-inset-bottom))' }}>✓ 등록하기</button>
            </form>
        </div>
    );
}
