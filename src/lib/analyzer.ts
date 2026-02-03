// 위험 분석 엔진 - 약물 상호작용 검사

interface Ingredient {
    code: string;
    nameKo: string;
}

interface AnalysisResult {
    ruleId: string;
    level: 'danger' | 'warning' | 'notice';
    triggerIngredient: Ingredient;
    targetIngredient?: Ingredient;
    message: {
        conclusion: string;
        reason: string;
        action: string;
    };
}

// 상호작용 룰 데이터베이스
const INTERACTION_RULES = [
    {
        trigger: 'WARFARIN',
        target: 'ASPIRIN',
        level: 'danger' as const,
        message: {
            conclusion: '심각한 출혈 위험 증가',
            reason: '두 약물 모두 혈액 응고를 억제하여 출혈 위험이 크게 증가합니다.',
            action: '즉시 의사와 상담하세요. 두 약물을 함께 복용하지 마세요.',
        },
    },
    {
        trigger: 'WARFARIN',
        target: 'OMEGA3',
        level: 'warning' as const,
        message: {
            conclusion: '출혈 위험 증가 가능',
            reason: '오메가3도 혈액을 묽게 하는 효과가 있어 출혈 위험이 증가할 수 있습니다.',
            action: '의사와 상담하여 용량 조절을 고려하세요.',
        },
    },
    {
        trigger: 'ASPIRIN',
        target: 'IBUPROFEN',
        level: 'warning' as const,
        message: {
            conclusion: '위장 출혈 위험 증가',
            reason: '두 NSAID 약물을 함께 복용하면 위장관 부작용이 증가합니다.',
            action: '한 가지 진통제만 복용하세요.',
        },
    },
];

// 상호작용 분석
export function analyzeInteractions(ingredients: Ingredient[]): {
    overallRisk: 'danger' | 'warning' | 'notice' | 'safe';
    results: AnalysisResult[];
} {
    const results: AnalysisResult[] = [];
    const codes = ingredients.map(i => i.code);

    for (const rule of INTERACTION_RULES) {
        const hasTrigger = codes.includes(rule.trigger);
        const hasTarget = codes.includes(rule.target);

        if (hasTrigger && hasTarget) {
            results.push({
                ruleId: `rule-${rule.trigger}-${rule.target}`,
                level: rule.level,
                triggerIngredient: ingredients.find(i => i.code === rule.trigger)!,
                targetIngredient: ingredients.find(i => i.code === rule.target),
                message: rule.message,
            });
        }
    }

    // 전체 위험도 결정
    let overallRisk: 'danger' | 'warning' | 'notice' | 'safe' = 'safe';
    if (results.some(r => r.level === 'danger')) overallRisk = 'danger';
    else if (results.some(r => r.level === 'warning')) overallRisk = 'warning';
    else if (results.length > 0) overallRisk = 'notice';

    return { overallRisk, results };
}

export { INTERACTION_RULES };
