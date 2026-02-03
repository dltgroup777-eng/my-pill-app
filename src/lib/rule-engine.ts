/**
 * 위험 분석 엔진 (v2)
 * 
 * 새로운 스키마(StandardIngredient, InteractionRule)에 맞게 업데이트됨.
 * 성분 코드 기반 정확한 매칭 및 개인화 가중치 적용.
 */

import { prisma } from './prisma';
import type { ExtractedIngredient } from './ocr-engine';

// ============================================
// 타입 정의
// ============================================

export type RiskLevel = 'notice' | 'warning' | 'danger';
export type RuleCategory = 'duplication' | 'ddi' | 'hdi' | 'fdi' | 'overdose';

export interface AnalysisResult {
    ruleId: string;
    level: RiskLevel;
    category: RuleCategory;
    triggerIngredient: {
        code: string;
        nameKo: string;
    };
    targetIngredient?: {
        code: string;
        nameKo: string;
    };
    message: {
        conclusion: string;
        reason: string;
        action: string;
    };
    evidenceUrl?: string;
    personalizedNote?: string; // 개인화된 추가 경고
}

export interface UserHealthProfile {
    liverIssue: boolean;
    kidneyIssue: boolean;
    bleedingRisk: boolean;
    pregnancyLactation: boolean;
    ageBand: string; // '20s' | '30s' | '40s' | '50s' | '60+'
}

export interface AnalysisReport {
    overallRisk: RiskLevel;
    results: AnalysisResult[];
    scannedIngredients: string[];
    baselineIngredients: string[];
    timestamp: Date;
    processingTime: number;
}

// ============================================
// 가중치 계산 함수
// ============================================

/**
 * 사용자 건강 상태에 따라 위험 등급을 조정합니다.
 */
function calculatePersonalizedRisk(
    baseRisk: RiskLevel,
    profile: UserHealthProfile | null,
    rule: {
        liverRiskWeight: number;
        kidneyRiskWeight: number;
        bleedingRiskWeight: number;
        pregnancyRiskWeight: number;
        elderlyRiskWeight: number;
    }
): { adjustedRisk: RiskLevel; personalizedNote?: string } {
    if (!profile) {
        return { adjustedRisk: baseRisk };
    }

    // 기본 점수: danger=3, warning=2, notice=1
    let score = baseRisk === 'danger' ? 3 : baseRisk === 'warning' ? 2 : 1;
    const notes: string[] = [];

    // 가중치 적용
    if (profile.liverIssue && rule.liverRiskWeight > 1) {
        score *= rule.liverRiskWeight;
        notes.push('⚠️ 간질환이 있어 위험이 더 높습니다');
    }
    if (profile.kidneyIssue && rule.kidneyRiskWeight > 1) {
        score *= rule.kidneyRiskWeight;
        notes.push('⚠️ 신장질환이 있어 위험이 더 높습니다');
    }
    if (profile.bleedingRisk && rule.bleedingRiskWeight > 1) {
        score *= rule.bleedingRiskWeight;
        notes.push('⚠️ 출혈 위험군이라 더욱 주의가 필요합니다');
    }
    if (profile.pregnancyLactation && rule.pregnancyRiskWeight > 1) {
        score *= rule.pregnancyRiskWeight;
        notes.push('⚠️ 임신/수유 중이라 특별한 주의가 필요합니다');
    }
    if (
        (profile.ageBand === '60+' || profile.ageBand === '70+') &&
        rule.elderlyRiskWeight > 1
    ) {
        score *= rule.elderlyRiskWeight;
        notes.push('⚠️ 고령자라 부작용 위험이 더 높습니다');
    }

    // 조정된 위험 등급 결정
    let adjustedRisk: RiskLevel;
    if (score >= 3) {
        adjustedRisk = 'danger';
    } else if (score >= 2) {
        adjustedRisk = 'warning';
    } else {
        adjustedRisk = 'notice';
    }

    return {
        adjustedRisk,
        personalizedNote: notes.length > 0 ? notes.join('\n') : undefined,
    };
}

// ============================================
// 메인 분석 함수
// ============================================

/**
 * 스캔된 성분과 기존 복용약(내 약상자)을 비교 분석합니다.
 * 
 * @param scannedIngredients - OCR로 추출한 성분 목록
 * @param userId - 사용자 ID (내 약상자 및 건강 프로필 조회용)
 * @returns 분석 결과 보고서
 */
export async function analyzeInteractions(
    scannedIngredients: ExtractedIngredient[],
    userId: string
): Promise<AnalysisReport> {
    const startTime = Date.now();
    const results: AnalysisResult[] = [];

    // 1. 사용자 건강 프로필 조회
    const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
    });
    const healthProfile: UserHealthProfile | null = userProfile
        ? {
            liverIssue: userProfile.liverIssue,
            kidneyIssue: userProfile.kidneyIssue,
            bleedingRisk: userProfile.bleedingRisk,
            pregnancyLactation: userProfile.pregnancyLactation,
            ageBand: userProfile.ageBand,
        }
        : null;

    // 2. 내 약상자(기존 복용약) 성분 조회
    const userProducts = await prisma.product.findMany({
        where: { userId },
        include: {
            ingredients: {
                include: {
                    standardIngredient: true,
                },
            },
        },
    });

    const baselineIngredientCodes = new Set<string>();
    for (const product of userProducts) {
        for (const ing of product.ingredients) {
            baselineIngredientCodes.add(ing.standardIngredient.code);
        }
    }

    // 3. 스캔된 성분 코드 목록
    const scannedCodes = scannedIngredients
        .filter((i) => i.standardCode)
        .map((i) => i.standardCode as string);

    // 모든 관련 성분 코드
    const allCodes = [...new Set([...scannedCodes, ...baselineIngredientCodes])];

    // 4. 상호작용 룰 조회
    const rules = await prisma.interactionRule.findMany({
        where: {
            isActive: true,
            OR: [
                { triggerIngredientId: { in: await getIngredientIds(allCodes) } },
                { targetIngredientId: { in: await getIngredientIds(allCodes) } },
            ],
        },
        include: {
            triggerIngredient: true,
            targetIngredient: true,
        },
    });

    // 5. 룰 매칭
    for (const rule of rules) {
        const triggerCode = rule.triggerIngredient.code;
        const targetCode = rule.targetIngredient?.code;

        // 스캔된 성분 또는 기존 성분에 트리거가 있는지 확인
        const hasTrigger =
            scannedCodes.includes(triggerCode) ||
            baselineIngredientCodes.has(triggerCode);

        if (!hasTrigger) continue;

        // 상호작용 대상 확인
        if (targetCode) {
            const hasTarget =
                scannedCodes.includes(targetCode) ||
                baselineIngredientCodes.has(targetCode);

            if (!hasTarget) continue;

            // 둘 다 같은 곳(스캔 또는 기존)에만 있으면 스킵 (교차 분석 목적)
            const triggerInScanned = scannedCodes.includes(triggerCode);
            const targetInScanned = scannedCodes.includes(targetCode);
            const triggerInBaseline = baselineIngredientCodes.has(triggerCode);
            const targetInBaseline = baselineIngredientCodes.has(targetCode);

            // 최소한 하나는 스캔에서, 하나는 기존에서 와야 함 (또는 둘 다 스캔)
            const crossInteraction =
                (triggerInScanned && targetInBaseline) ||
                (triggerInBaseline && targetInScanned) ||
                (triggerInScanned && targetInScanned);

            if (!crossInteraction) continue;
        } else {
            // target이 없는 룰 (overdose 등)은 스캔된 성분에만 적용
            if (!scannedCodes.includes(triggerCode)) continue;
        }

        // 개인화된 위험도 계산
        const { adjustedRisk, personalizedNote } = calculatePersonalizedRisk(
            rule.baseRisk as RiskLevel,
            healthProfile,
            {
                liverRiskWeight: rule.liverRiskWeight,
                kidneyRiskWeight: rule.kidneyRiskWeight,
                bleedingRiskWeight: rule.bleedingRiskWeight,
                pregnancyRiskWeight: rule.pregnancyRiskWeight,
                elderlyRiskWeight: rule.elderlyRiskWeight,
            }
        );

        results.push({
            ruleId: rule.id,
            level: adjustedRisk,
            category: rule.category as RuleCategory,
            triggerIngredient: {
                code: triggerCode,
                nameKo: rule.triggerIngredient.nameKo,
            },
            targetIngredient: rule.targetIngredient
                ? {
                    code: targetCode!,
                    nameKo: rule.targetIngredient.nameKo,
                }
                : undefined,
            message: {
                conclusion: rule.conclusion,
                reason: rule.reason,
                action: rule.action,
            },
            evidenceUrl: rule.evidenceUrl || undefined,
            personalizedNote,
        });
    }

    // 6. 동일 효능군 중복 체크 (스키마의 therapeuticGroup 활용)
    const therapeuticGroupCheck = await checkTherapeuticGroupDuplication(
        scannedCodes,
        [...baselineIngredientCodes]
    );
    results.push(...therapeuticGroupCheck);

    // 7. 결과 정렬 (위험도 순)
    results.sort((a, b) => {
        const order = { danger: 0, warning: 1, notice: 2 };
        return order[a.level] - order[b.level];
    });

    const processingTime = Date.now() - startTime;

    return {
        overallRisk: getHighestRisk(results),
        results,
        scannedIngredients: scannedIngredients.map((i) => i.standardNameKo || i.originalText),
        baselineIngredients: [...baselineIngredientCodes],
        timestamp: new Date(),
        processingTime,
    };
}

/**
 * 성분 코드 → ID 변환 헬퍼
 */
async function getIngredientIds(codes: string[]): Promise<string[]> {
    const ingredients = await prisma.standardIngredient.findMany({
        where: { code: { in: codes } },
        select: { id: true },
    });
    return ingredients.map((i) => i.id);
}

/**
 * 동일 효능군 중복 체크
 */
async function checkTherapeuticGroupDuplication(
    scannedCodes: string[],
    baselineCodes: string[]
): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    // 스캔된 성분의 효능군 조회
    const scannedIngredients = await prisma.standardIngredient.findMany({
        where: { code: { in: scannedCodes } },
    });

    // 기존 성분의 효능군 조회
    const baselineIngredients = await prisma.standardIngredient.findMany({
        where: { code: { in: baselineCodes } },
    });

    // 효능군별 그룹화
    const scannedGroups = new Map<string, typeof scannedIngredients>();
    for (const ing of scannedIngredients) {
        if (ing.therapeuticGroup) {
            if (!scannedGroups.has(ing.therapeuticGroup)) {
                scannedGroups.set(ing.therapeuticGroup, []);
            }
            scannedGroups.get(ing.therapeuticGroup)!.push(ing);
        }
    }

    const baselineGroups = new Map<string, typeof baselineIngredients>();
    for (const ing of baselineIngredients) {
        if (ing.therapeuticGroup) {
            if (!baselineGroups.has(ing.therapeuticGroup)) {
                baselineGroups.set(ing.therapeuticGroup, []);
            }
            baselineGroups.get(ing.therapeuticGroup)!.push(ing);
        }
    }

    // 교차 중복 체크
    for (const [group, scannedIngs] of scannedGroups) {
        const baselineIngs = baselineGroups.get(group);
        if (baselineIngs && baselineIngs.length > 0) {
            // 이미 InteractionRule에서 정의된 중복이 아닌 경우만 추가
            for (const scanned of scannedIngs) {
                for (const baseline of baselineIngs) {
                    if (scanned.code !== baseline.code) {
                        results.push({
                            ruleId: `therapeutic_group_${group}_${scanned.code}_${baseline.code}`,
                            level: 'notice',
                            category: 'duplication',
                            triggerIngredient: {
                                code: scanned.code,
                                nameKo: scanned.nameKo,
                            },
                            targetIngredient: {
                                code: baseline.code,
                                nameKo: baseline.nameKo,
                            },
                            message: {
                                conclusion: `📌 동일 효능군 약물 중복`,
                                reason: `${scanned.nameKo}과(와) ${baseline.nameKo}은(는) 같은 ${getTherapeuticGroupName(group)} 계열입니다. 효과 중복으로 부작용이 증가할 수 있습니다.`,
                                action: '의사 또는 약사에게 두 약물을 함께 복용해도 되는지 확인하세요.',
                            },
                        });
                    }
                }
            }
        }
    }

    return results;
}

/**
 * 효능군 코드 → 한글명 변환
 */
function getTherapeuticGroupName(group: string): string {
    const names: Record<string, string> = {
        anticoagulant: '항응고제',
        antiplatelet: '항혈소판제',
        analgesic: '진통제',
        nsaid: '비스테로이드성 항염증제(NSAID)',
        statin: '스타틴(콜레스테롤 약)',
        ace_inhibitor: 'ACE 억제제',
        arb: 'ARB(안지오텐신 수용체 차단제)',
        ccb: '칼슘채널차단제',
        antidiabetic: '당뇨병약',
        sulfonylurea: '설포닐우레아',
        ppi: 'PPI(위산억제제)',
        antibiotic_penicillin: '페니실린계 항생제',
        antibiotic_quinolone: '퀴놀론계 항생제',
        thyroid: '갑상선 호르몬제',
        ssri: 'SSRI(항우울제)',
        sedative: '수면제/진정제',
        benzodiazepine: '벤조디아제핀',
        vitamin: '비타민',
        mineral: '미네랄',
        supplement: '보충제',
        herbal: '허브보충제',
        food: '음식',
    };
    return names[group] || group;
}

/**
 * 결과 중 가장 높은 위험도 반환
 */
export function getHighestRisk(results: AnalysisResult[]): RiskLevel {
    if (results.some((r) => r.level === 'danger')) return 'danger';
    if (results.some((r) => r.level === 'warning')) return 'warning';
    return 'notice';
}

/**
 * 위험도별 색상 반환
 */
export function getRiskColor(level: RiskLevel): string {
    switch (level) {
        case 'danger':
            return '#EF4444'; // 빨강
        case 'warning':
            return '#F97316'; // 주황
        case 'notice':
            return '#EAB308'; // 노랑
        default:
            return '#6B7280'; // 회색
    }
}

/**
 * 위험도별 라벨 반환
 */
export function getRiskLabel(level: RiskLevel): string {
    switch (level) {
        case 'danger':
            return '위험';
        case 'warning':
            return '주의';
        case 'notice':
            return '참고';
        default:
            return '알 수 없음';
    }
}
