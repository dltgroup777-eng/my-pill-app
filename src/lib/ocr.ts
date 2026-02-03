// Mock OCR Engine - tesseract.js 대신 Mock 사용
const MOCK_MODE = !process.env.DATABASE_URL;

// 성분 데이터베이스 (Mock)
const INGREDIENT_DB = [
    { code: 'ASPIRIN', nameKo: '아스피린', nameEn: 'Aspirin', category: '해열진통제' },
    { code: 'IBUPROFEN', nameKo: '이부프로펜', nameEn: 'Ibuprofen', category: 'NSAID' },
    { code: 'ACETAMINOPHEN', nameKo: '아세트아미노펜', nameEn: 'Acetaminophen', category: '해열진통제' },
    { code: 'WARFARIN', nameKo: '와파린', nameEn: 'Warfarin', category: '항응고제' },
    { code: 'OMEGA3', nameKo: '오메가3', nameEn: 'Omega-3', category: '오메가지방산' },
    { code: 'VITAMIN_D', nameKo: '비타민 D', nameEn: 'Vitamin D', category: '비타민' },
    { code: 'METFORMIN', nameKo: '메트포르민', nameEn: 'Metformin', category: '당뇨병약' },
];

// OCR 텍스트 추출 (Mock)
export async function extractTextFromImage(imageData: string): Promise<string> {
    if (MOCK_MODE) {
        // Mock: 이미지에서 추출된 것처럼 가장
        console.log('[OCR] Mock mode - returning sample text');
        return '아스피린 500mg 1일 2회 식후 복용';
    }

    // 실제 Tesseract.js 사용
    const Tesseract = await import('tesseract.js');
    const result = await Tesseract.recognize(imageData, 'kor+eng');
    return result.data.text;
}

// 텍스트에서 성분 추출
export function extractIngredients(text: string) {
    const found: typeof INGREDIENT_DB = [];
    const normalizedText = text.toLowerCase();

    for (const ing of INGREDIENT_DB) {
        if (
            normalizedText.includes(ing.nameKo.toLowerCase()) ||
            normalizedText.includes(ing.nameEn.toLowerCase())
        ) {
            found.push(ing);
        }
    }

    return found.length > 0 ? found : [INGREDIENT_DB[0]]; // 기본값: 아스피린
}

// 성분 검색
export function searchIngredients(query: string) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return INGREDIENT_DB.filter(
        ing => ing.nameKo.includes(q) || ing.nameEn.toLowerCase().includes(q)
    );
}

export { INGREDIENT_DB, MOCK_MODE };
