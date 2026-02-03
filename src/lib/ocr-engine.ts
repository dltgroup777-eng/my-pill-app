/**
 * OCR 성분 추출 및 매핑 엔진
 * 
 * Tesseract.js를 사용하여 약물/영양제 이미지에서 성분명을 추출하고,
 * DB의 표준 성분과 매핑합니다.
 */

import Tesseract from 'tesseract.js';
import { prisma } from './prisma';

// ============================================
// 타입 정의
// ============================================

export interface ExtractedIngredient {
    originalText: string;      // OCR로 추출한 원본 텍스트
    standardCode: string | null;  // 매핑된 표준 성분 코드
    standardNameKo: string | null; // 한국어 표준명
    confidence: number;        // 매칭 신뢰도 (0-1)
    amount?: number;           // 추출된 용량
    unit?: string;             // 용량 단위
}

export interface OCRResult {
    success: boolean;
    rawText: string;           // 전체 OCR 텍스트
    ingredients: ExtractedIngredient[];
    processingTime: number;    // 처리 시간 (ms)
    error?: string;
}

// ============================================
// 텍스트 정규화 유틸리티
// ============================================

/**
 * OCR 텍스트를 정규화합니다.
 * - 불필요한 공백 제거
 * - 특수문자 정리
 * - 일반적인 OCR 오류 수정
 */
function normalizeText(text: string): string {
    return text
        // 여러 공백을 하나로
        .replace(/\s+/g, ' ')
        // 줄바꿈을 공백으로
        .replace(/[\r\n]+/g, ' ')
        // 일반적인 OCR 오타 수정
        .replace(/[oO]mg/g, '0mg')  // 0 → O 오인식
        .replace(/[lI]mg/g, '1mg')  // 1 → l/I 오인식
        // 괄호 정규화
        .replace(/【/g, '[').replace(/】/g, ']')
        .replace(/〔/g, '(').replace(/〕/g, ')')
        // 앞뒤 공백 제거
        .trim();
}

/**
 * 성분명 검색을 위한 텍스트 정규화
 * 더 공격적인 정규화로 매칭 확률 향상
 */
function normalizeForMatching(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, '')       // 모든 공백 제거
        .replace(/[-_]/g, '')      // 하이픈, 언더스코어 제거
        .replace(/[·•]/g, '')      // 중점 제거
        .replace(/[()[\]{}]/g, '') // 괄호류 제거
        .trim();
}

// ============================================
// 용량 추출 유틸리티
// ============================================

interface DosageInfo {
    amount: number;
    unit: string;
}

/**
 * 텍스트에서 용량 정보를 추출합니다.
 * 예: "아세트아미노펜 500mg" → { amount: 500, unit: 'mg' }
 */
function extractDosage(text: string): DosageInfo | null {
    // 패턴: 숫자 + 단위
    const patterns = [
        /(\d+(?:\.\d+)?)\s*(mg|g|mcg|µg|iu|ml|cc)/i,
        /(\d+(?:\.\d+)?)\s*(밀리그램|그램|마이크로그램)/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const amount = parseFloat(match[1]);
            let unit = match[2].toLowerCase();

            // 단위 정규화
            if (unit === '밀리그램') unit = 'mg';
            if (unit === '그램') unit = 'g';
            if (unit === '마이크로그램' || unit === 'µg') unit = 'mcg';

            return { amount, unit };
        }
    }

    return null;
}

// ============================================
// 성분명 추출 유틸리티
// ============================================

/**
 * OCR 텍스트에서 성분명 후보를 추출합니다.
 */
function extractIngredientCandidates(text: string): string[] {
    const candidates: string[] = [];

    // 패턴 1: "성분" 또는 "주성분" 다음에 오는 텍스트
    const componentPatterns = [
        /(?:주?\s*성\s*분|원료|유효성분)\s*[:：]\s*([^,\n]+)/gi,
        /(?:주?\s*성\s*분|원료|유효성분)\s*([가-힣a-zA-Z]+)/gi,
    ];

    for (const pattern of componentPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            candidates.push(match[1].trim());
        }
    }

    // 패턴 2: 용량이 붙은 성분명 (예: "아세트아미노펜 500mg")
    const dosagePattern = /([가-힣a-zA-Z]+(?:\s*[가-힣a-zA-Z]+)*)\s*\d+(?:\.\d+)?\s*(?:mg|g|mcg|iu)/gi;
    let match;
    while ((match = dosagePattern.exec(text)) !== null) {
        candidates.push(match[1].trim());
    }

    // 패턴 3: 괄호 안의 일반명 (예: "타이레놀(아세트아미노펜)")
    const bracketPattern = /\(([가-힣a-zA-Z\s]+)\)/g;
    while ((match = bracketPattern.exec(text)) !== null) {
        candidates.push(match[1].trim());
    }

    // 패턴 4: 줄 단위로 분리된 성분 (라벨 형식)
    const lines = text.split(/[\n,]/);
    for (const line of lines) {
        const trimmed = line.trim();
        // 너무 짧거나 긴 것은 제외
        if (trimmed.length >= 2 && trimmed.length <= 30) {
            // 숫자로만 이루어진 것 제외
            if (!/^\d+$/.test(trimmed)) {
                candidates.push(trimmed);
            }
        }
    }

    // 중복 제거
    return [...new Set(candidates)];
}

// ============================================
// DB 매핑 함수
// ============================================

/**
 * 성분명 후보를 DB의 표준 성분과 매칭합니다.
 */
async function matchIngredient(candidateText: string): Promise<ExtractedIngredient | null> {
    const normalizedCandidate = normalizeForMatching(candidateText);

    if (normalizedCandidate.length < 2) {
        return null;
    }

    // 1. 정확히 일치하는 별명 검색
    const exactMatch = await prisma.ingredientAlias.findFirst({
        where: {
            aliasName: {
                equals: candidateText,
                // SQLite에서는 case-insensitive가 기본
            },
        },
        include: {
            standardIngredient: true,
        },
        orderBy: {
            priority: 'desc',
        },
    });

    if (exactMatch) {
        const dosage = extractDosage(candidateText);
        return {
            originalText: candidateText,
            standardCode: exactMatch.standardIngredient.code,
            standardNameKo: exactMatch.standardIngredient.nameKo,
            confidence: 1.0,
            amount: dosage?.amount,
            unit: dosage?.unit,
        };
    }

    // 2. 부분 일치 검색 (LIKE 사용)
    const partialMatches = await prisma.ingredientAlias.findMany({
        where: {
            aliasName: {
                contains: normalizedCandidate.length > 3
                    ? normalizedCandidate.substring(0, Math.min(normalizedCandidate.length, 5))
                    : normalizedCandidate,
            },
        },
        include: {
            standardIngredient: true,
        },
        orderBy: {
            priority: 'desc',
        },
        take: 5,
    });

    // 레벤슈타인 유사도 계산
    for (const match of partialMatches) {
        const similarity = calculateSimilarity(
            normalizedCandidate,
            normalizeForMatching(match.aliasName)
        );

        if (similarity > 0.7) {
            const dosage = extractDosage(candidateText);
            return {
                originalText: candidateText,
                standardCode: match.standardIngredient.code,
                standardNameKo: match.standardIngredient.nameKo,
                confidence: similarity,
                amount: dosage?.amount,
                unit: dosage?.unit,
            };
        }
    }

    // 3. 표준 성분명 직접 검색
    const directMatch = await prisma.standardIngredient.findFirst({
        where: {
            OR: [
                { nameKo: { contains: candidateText } },
                { nameEn: { contains: candidateText } },
            ],
        },
    });

    if (directMatch) {
        const dosage = extractDosage(candidateText);
        return {
            originalText: candidateText,
            standardCode: directMatch.code,
            standardNameKo: directMatch.nameKo,
            confidence: 0.8,
            amount: dosage?.amount,
            unit: dosage?.unit,
        };
    }

    return null;
}

/**
 * 두 문자열의 유사도를 계산합니다 (Jaro-Winkler 기반 단순화)
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    // 더 짧은 문자열이 더 긴 문자열에 포함되어 있으면 높은 점수
    if (str2.includes(str1) || str1.includes(str2)) {
        const minLen = Math.min(str1.length, str2.length);
        const maxLen = Math.max(str1.length, str2.length);
        return 0.7 + (0.3 * minLen / maxLen);
    }

    // 공통 문자 수 기반 간단한 유사도
    const set1 = new Set(str1);
    const set2 = new Set(str2);
    let common = 0;
    for (const char of set1) {
        if (set2.has(char)) common++;
    }

    return common / Math.max(set1.size, set2.size);
}

// ============================================
// 메인 OCR 함수
// ============================================

/**
 * 이미지에서 성분을 추출하고 DB와 매핑합니다.
 * 
 * @param imageSource - 이미지 URL, File 객체, 또는 Base64 문자열
 * @returns OCR 결과 및 매핑된 성분 목록
 */
export async function extractIngredientsFromImage(
    imageSource: string | File | Buffer
): Promise<OCRResult> {
    const startTime = Date.now();

    try {
        // 1. Tesseract OCR 실행
        console.log('📷 OCR 분석 시작...');

        const result = await Tesseract.recognize(
            imageSource,
            'kor+eng', // 한국어 + 영어
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`  진행률: ${Math.round(m.progress * 100)}%`);
                    }
                },
            }
        );

        const rawText = result.data.text;
        console.log('📝 OCR 원본 텍스트:', rawText.substring(0, 200) + '...');

        // 2. 텍스트 정규화
        const normalizedText = normalizeText(rawText);

        // 3. 성분 후보 추출
        const candidates = extractIngredientCandidates(normalizedText);
        console.log(`🔍 성분 후보 ${candidates.length}개 발견`);

        // 4. DB 매핑
        const ingredients: ExtractedIngredient[] = [];
        const matchedCodes = new Set<string>(); // 중복 방지

        for (const candidate of candidates) {
            const matched = await matchIngredient(candidate);
            if (matched && matched.standardCode && !matchedCodes.has(matched.standardCode)) {
                ingredients.push(matched);
                matchedCodes.add(matched.standardCode);
                console.log(`  ✅ 매칭: "${candidate}" → ${matched.standardNameKo}`);
            }
        }

        const processingTime = Date.now() - startTime;
        console.log(`⏱️ 처리 완료: ${processingTime}ms, ${ingredients.length}개 성분 매칭`);

        return {
            success: true,
            rawText: normalizedText,
            ingredients,
            processingTime,
        };

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ OCR 오류:', error);

        return {
            success: false,
            rawText: '',
            ingredients: [],
            processingTime,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * 수동 입력 텍스트에서 성분을 추출합니다.
 * (OCR 없이 직접 텍스트 분석)
 */
export async function extractIngredientsFromText(text: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
        const normalizedText = normalizeText(text);
        const candidates = extractIngredientCandidates(normalizedText);

        const ingredients: ExtractedIngredient[] = [];
        const matchedCodes = new Set<string>();

        for (const candidate of candidates) {
            const matched = await matchIngredient(candidate);
            if (matched && matched.standardCode && !matchedCodes.has(matched.standardCode)) {
                ingredients.push(matched);
                matchedCodes.add(matched.standardCode);
            }
        }

        return {
            success: true,
            rawText: normalizedText,
            ingredients,
            processingTime: Date.now() - startTime,
        };

    } catch (error) {
        return {
            success: false,
            rawText: text,
            ingredients: [],
            processingTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * 성분명으로 직접 검색합니다.
 * (자동완성 UI용)
 */
export async function searchIngredient(query: string, limit = 10) {
    if (query.length < 1) return [];

    // 별명 테이블에서 검색
    const aliases = await prisma.ingredientAlias.findMany({
        where: {
            aliasName: {
                contains: query,
            },
        },
        include: {
            standardIngredient: true,
        },
        orderBy: {
            priority: 'desc',
        },
        take: limit,
    });

    // 중복 제거 (같은 표준 성분)
    const seen = new Set<string>();
    const results = [];

    for (const alias of aliases) {
        if (!seen.has(alias.standardIngredient.code)) {
            seen.add(alias.standardIngredient.code);
            results.push({
                code: alias.standardIngredient.code,
                nameKo: alias.standardIngredient.nameKo,
                nameEn: alias.standardIngredient.nameEn,
                category: alias.standardIngredient.category,
                matchedAlias: alias.aliasName,
            });
        }
    }

    return results;
}
