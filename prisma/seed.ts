/**
 * 복용약 관리 시스템 - 시드 데이터
 * 
 * 30종 주요 위험 약물/성분 및 상호작용 룰 데이터
 * 
 * 포함 내용:
 * 1. StandardIngredient: 표준 성분 마스터
 * 2. IngredientAlias: OCR 인식용 별명 (한글/영어/브랜드명/약어)
 * 3. InteractionRule: DDI, HDI, FDI 상호작용 룰
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 1. 표준 성분 데이터 (30종)
// ============================================
const standardIngredients = [
    // === 항응고제 ===
    {
        code: 'WARFARIN',
        nameKo: '와파린',
        nameEn: 'Warfarin',
        category: '항응고제',
        therapeuticGroup: 'anticoagulant',
        maxDailyDose: 10,
        maxDailyUnit: 'mg',
        description: '혈액 응고를 억제하는 약물. 비타민K 길항제.'
    },
    {
        code: 'ASPIRIN',
        nameKo: '아스피린',
        nameEn: 'Aspirin',
        category: '해열진통제/항혈소판제',
        therapeuticGroup: 'antiplatelet',
        maxDailyDose: 4000,
        maxDailyUnit: 'mg',
        description: '해열, 진통, 항염 및 혈소판 응집 억제 작용.'
    },
    {
        code: 'CLOPIDOGREL',
        nameKo: '클로피도그렐',
        nameEn: 'Clopidogrel',
        category: '항혈소판제',
        therapeuticGroup: 'antiplatelet',
        maxDailyDose: 75,
        maxDailyUnit: 'mg',
        description: '혈소판 응집을 억제하여 혈전 형성을 방지.'
    },

    // === 진통제 ===
    {
        code: 'ACETAMINOPHEN',
        nameKo: '아세트아미노펜',
        nameEn: 'Acetaminophen',
        category: '해열진통제',
        therapeuticGroup: 'analgesic',
        maxDailyDose: 4000,
        maxDailyUnit: 'mg',
        description: '해열 및 진통 작용. 과량 복용 시 간 손상 위험.'
    },
    {
        code: 'IBUPROFEN',
        nameKo: '이부프로펜',
        nameEn: 'Ibuprofen',
        category: 'NSAID',
        therapeuticGroup: 'nsaid',
        maxDailyDose: 3200,
        maxDailyUnit: 'mg',
        description: '비스테로이드성 항염증제. 진통, 해열, 항염 작용.'
    },
    {
        code: 'NAPROXEN',
        nameKo: '나프록센',
        nameEn: 'Naproxen',
        category: 'NSAID',
        therapeuticGroup: 'nsaid',
        maxDailyDose: 1500,
        maxDailyUnit: 'mg',
        description: 'NSAID. 관절염, 통증, 염증 치료.'
    },

    // === 스타틴 (콜레스테롤 약) ===
    {
        code: 'SIMVASTATIN',
        nameKo: '심바스타틴',
        nameEn: 'Simvastatin',
        category: '스타틴',
        therapeuticGroup: 'statin',
        maxDailyDose: 40,
        maxDailyUnit: 'mg',
        description: 'HMG-CoA 환원효소 억제제. 콜레스테롤 저하.'
    },
    {
        code: 'ATORVASTATIN',
        nameKo: '아토르바스타틴',
        nameEn: 'Atorvastatin',
        category: '스타틴',
        therapeuticGroup: 'statin',
        maxDailyDose: 80,
        maxDailyUnit: 'mg',
        description: '강력한 스타틴. 고콜레스테롤혈증 치료.'
    },
    {
        code: 'ROSUVASTATIN',
        nameKo: '로수바스타틴',
        nameEn: 'Rosuvastatin',
        category: '스타틴',
        therapeuticGroup: 'statin',
        maxDailyDose: 40,
        maxDailyUnit: 'mg',
        description: '최신 스타틴. 간 대사 경로가 달라 상호작용 적음.'
    },

    // === 혈압약 ===
    {
        code: 'LISINOPRIL',
        nameKo: '리시노프릴',
        nameEn: 'Lisinopril',
        category: 'ACE억제제',
        therapeuticGroup: 'ace_inhibitor',
        maxDailyDose: 80,
        maxDailyUnit: 'mg',
        description: 'ACE 억제제. 고혈압, 심부전 치료.'
    },
    {
        code: 'AMLODIPINE',
        nameKo: '암로디핀',
        nameEn: 'Amlodipine',
        category: '칼슘채널차단제',
        therapeuticGroup: 'ccb',
        maxDailyDose: 10,
        maxDailyUnit: 'mg',
        description: '칼슘 채널 차단제. 고혈압, 협심증 치료.'
    },
    {
        code: 'LOSARTAN',
        nameKo: '로사르탄',
        nameEn: 'Losartan',
        category: 'ARB',
        therapeuticGroup: 'arb',
        maxDailyDose: 100,
        maxDailyUnit: 'mg',
        description: '안지오텐신 II 수용체 차단제. 고혈압 치료.'
    },

    // === 당뇨약 ===
    {
        code: 'METFORMIN',
        nameKo: '메트포르민',
        nameEn: 'Metformin',
        category: '당뇨병약',
        therapeuticGroup: 'antidiabetic',
        maxDailyDose: 2550,
        maxDailyUnit: 'mg',
        description: '제2형 당뇨병 1차 치료제. 인슐린 감수성 개선.'
    },
    {
        code: 'GLIMEPIRIDE',
        nameKo: '글리메피리드',
        nameEn: 'Glimepiride',
        category: '설포닐우레아',
        therapeuticGroup: 'sulfonylurea',
        maxDailyDose: 8,
        maxDailyUnit: 'mg',
        description: '인슐린 분비 촉진. 저혈당 주의.'
    },

    // === 위장약 ===
    {
        code: 'OMEPRAZOLE',
        nameKo: '오메프라졸',
        nameEn: 'Omeprazole',
        category: 'PPI',
        therapeuticGroup: 'ppi',
        maxDailyDose: 40,
        maxDailyUnit: 'mg',
        description: '양성자 펌프 억제제. 위산 분비 억제.'
    },
    {
        code: 'ESOMEPRAZOLE',
        nameKo: '에소메프라졸',
        nameEn: 'Esomeprazole',
        category: 'PPI',
        therapeuticGroup: 'ppi',
        maxDailyDose: 40,
        maxDailyUnit: 'mg',
        description: '오메프라졸의 S-이성질체. 위산 억제.'
    },

    // === 항생제 ===
    {
        code: 'AMOXICILLIN',
        nameKo: '아목시실린',
        nameEn: 'Amoxicillin',
        category: '항생제',
        therapeuticGroup: 'antibiotic_penicillin',
        maxDailyDose: 3000,
        maxDailyUnit: 'mg',
        description: '페니실린계 항생제. 세균 감염 치료.'
    },
    {
        code: 'CIPROFLOXACIN',
        nameKo: '시프로플록사신',
        nameEn: 'Ciprofloxacin',
        category: '항생제',
        therapeuticGroup: 'antibiotic_quinolone',
        maxDailyDose: 1500,
        maxDailyUnit: 'mg',
        description: '퀴놀론계 항생제. 요로감염, 호흡기 감염 치료.'
    },

    // === 갑상선약 ===
    {
        code: 'LEVOTHYROXINE',
        nameKo: '레보티록신',
        nameEn: 'Levothyroxine',
        category: '갑상선호르몬',
        therapeuticGroup: 'thyroid',
        maxDailyDose: 300,
        maxDailyUnit: 'mcg',
        description: '갑상선 호르몬. 갑상선기능저하증 치료.'
    },

    // === 항우울제 ===
    {
        code: 'SERTRALINE',
        nameKo: '설트랄린',
        nameEn: 'Sertraline',
        category: 'SSRI',
        therapeuticGroup: 'ssri',
        maxDailyDose: 200,
        maxDailyUnit: 'mg',
        description: '선택적 세로토닌 재흡수 억제제. 우울증, 불안장애 치료.'
    },
    {
        code: 'FLUOXETINE',
        nameKo: '플루옥세틴',
        nameEn: 'Fluoxetine',
        category: 'SSRI',
        therapeuticGroup: 'ssri',
        maxDailyDose: 80,
        maxDailyUnit: 'mg',
        description: 'SSRI 계열 항우울제. 우울증, 강박장애 치료.'
    },

    // === 수면제/진정제 ===
    {
        code: 'ZOLPIDEM',
        nameKo: '졸피뎀',
        nameEn: 'Zolpidem',
        category: '수면제',
        therapeuticGroup: 'sedative',
        maxDailyDose: 10,
        maxDailyUnit: 'mg',
        description: '비벤조디아제핀계 수면제. 불면증 단기 치료.'
    },
    {
        code: 'ALPRAZOLAM',
        nameKo: '알프라졸람',
        nameEn: 'Alprazolam',
        category: '벤조디아제핀',
        therapeuticGroup: 'benzodiazepine',
        maxDailyDose: 4,
        maxDailyUnit: 'mg',
        description: '벤조디아제핀. 불안장애, 공황장애 치료.'
    },

    // === 영양제/보충제 ===
    {
        code: 'VITAMIN_D',
        nameKo: '비타민D',
        nameEn: 'Vitamin D',
        category: '비타민',
        therapeuticGroup: 'vitamin',
        maxDailyDose: 4000,
        maxDailyUnit: 'IU',
        description: '칼슘 흡수 촉진, 뼈 건강 유지.'
    },
    {
        code: 'VITAMIN_K',
        nameKo: '비타민K',
        nameEn: 'Vitamin K',
        category: '비타민',
        therapeuticGroup: 'vitamin',
        maxDailyDose: 120,
        maxDailyUnit: 'mcg',
        description: '혈액 응고에 필수. 와파린과 상호작용.'
    },
    {
        code: 'OMEGA3',
        nameKo: '오메가3',
        nameEn: 'Omega-3 Fatty Acids',
        category: '오메가지방산',
        therapeuticGroup: 'supplement',
        maxDailyDose: 4000,
        maxDailyUnit: 'mg',
        description: '심혈관 건강, 항염 작용. 고용량 시 출혈 위험 증가.'
    },
    {
        code: 'GINKGO',
        nameKo: '은행잎추출물',
        nameEn: 'Ginkgo Biloba',
        category: '허브보충제',
        therapeuticGroup: 'herbal',
        maxDailyDose: 240,
        maxDailyUnit: 'mg',
        description: '혈액순환 개선. 항응고제와 상호작용 주의.'
    },
    {
        code: 'ST_JOHNS_WORT',
        nameKo: '세인트존스워트',
        nameEn: "St. John's Wort",
        category: '허브보충제',
        therapeuticGroup: 'herbal',
        maxDailyDose: 900,
        maxDailyUnit: 'mg',
        description: '우울증 보조. 다수 약물과 상호작용.'
    },
    {
        code: 'CALCIUM',
        nameKo: '칼슘',
        nameEn: 'Calcium',
        category: '미네랄',
        therapeuticGroup: 'mineral',
        maxDailyDose: 2500,
        maxDailyUnit: 'mg',
        description: '뼈 건강, 근육 기능. 일부 항생제 흡수 방해.'
    },

    // === 음식 (FDI용) ===
    {
        code: 'GRAPEFRUIT',
        nameKo: '자몽',
        nameEn: 'Grapefruit',
        category: '음식',
        therapeuticGroup: 'food',
        maxDailyDose: null,
        maxDailyUnit: null,
        description: 'CYP3A4 효소 억제. 다수 약물 혈중 농도 증가.'
    },
];

// ============================================
// 2. 성분 별명(Alias) 데이터
// OCR 인식률 향상을 위한 다양한 표기
// ============================================
const ingredientAliases: Record<string, { name: string; type: string }[]> = {
    WARFARIN: [
        { name: '와파린', type: 'korean' },
        { name: 'warfarin', type: 'english' },
        { name: 'Warfarin', type: 'english' },
        { name: 'WARFARIN', type: 'english' },
        { name: '쿠마딘', type: 'brand' },
        { name: 'Coumadin', type: 'brand' },
        { name: '와르파린', type: 'korean' }, // 오타 대응
        { name: '와파린나트륨', type: 'korean' },
        { name: 'warfarin sodium', type: 'english' },
    ],
    ASPIRIN: [
        { name: '아스피린', type: 'korean' },
        { name: 'aspirin', type: 'english' },
        { name: 'Aspirin', type: 'english' },
        { name: 'ASA', type: 'abbreviation' },
        { name: '아세틸살리실산', type: 'korean' },
        { name: 'acetylsalicylic acid', type: 'english' },
        { name: '바이엘아스피린', type: 'brand' },
        { name: '아스피린프로텍트', type: 'brand' },
        { name: '아스프린', type: 'korean' }, // 오타 대응
    ],
    CLOPIDOGREL: [
        { name: '클로피도그렐', type: 'korean' },
        { name: 'clopidogrel', type: 'english' },
        { name: 'Clopidogrel', type: 'english' },
        { name: '플라빅스', type: 'brand' },
        { name: 'Plavix', type: 'brand' },
        { name: '클로피도그렐비스', type: 'korean' },
    ],
    ACETAMINOPHEN: [
        { name: '아세트아미노펜', type: 'korean' },
        { name: 'acetaminophen', type: 'english' },
        { name: 'Acetaminophen', type: 'english' },
        { name: '파라세타몰', type: 'korean' },
        { name: 'paracetamol', type: 'english' },
        { name: 'Paracetamol', type: 'english' },
        { name: 'APAP', type: 'abbreviation' },
        { name: '타이레놀', type: 'brand' },
        { name: 'Tylenol', type: 'brand' },
        { name: '게보린', type: 'brand' },
        { name: '펜잘', type: 'brand' },
        { name: '아세타미노펜', type: 'korean' }, // 오타 대응
    ],
    IBUPROFEN: [
        { name: '이부프로펜', type: 'korean' },
        { name: 'ibuprofen', type: 'english' },
        { name: 'Ibuprofen', type: 'english' },
        { name: '애드빌', type: 'brand' },
        { name: 'Advil', type: 'brand' },
        { name: '부루펜', type: 'brand' },
        { name: '이브', type: 'brand' },
        { name: '이부펜', type: 'korean' }, // 오타 대응
    ],
    NAPROXEN: [
        { name: '나프록센', type: 'korean' },
        { name: 'naproxen', type: 'english' },
        { name: 'Naproxen', type: 'english' },
        { name: '낙센', type: 'brand' },
        { name: '알리브', type: 'brand' },
        { name: 'Aleve', type: 'brand' },
    ],
    SIMVASTATIN: [
        { name: '심바스타틴', type: 'korean' },
        { name: 'simvastatin', type: 'english' },
        { name: 'Simvastatin', type: 'english' },
        { name: '조코', type: 'brand' },
        { name: 'Zocor', type: 'brand' },
        { name: '심바코', type: 'brand' },
    ],
    ATORVASTATIN: [
        { name: '아토르바스타틴', type: 'korean' },
        { name: 'atorvastatin', type: 'english' },
        { name: 'Atorvastatin', type: 'english' },
        { name: '리피토', type: 'brand' },
        { name: 'Lipitor', type: 'brand' },
        { name: '아토바', type: 'brand' },
    ],
    ROSUVASTATIN: [
        { name: '로수바스타틴', type: 'korean' },
        { name: 'rosuvastatin', type: 'english' },
        { name: 'Rosuvastatin', type: 'english' },
        { name: '크레스토', type: 'brand' },
        { name: 'Crestor', type: 'brand' },
    ],
    LISINOPRIL: [
        { name: '리시노프릴', type: 'korean' },
        { name: 'lisinopril', type: 'english' },
        { name: 'Lisinopril', type: 'english' },
        { name: '제스트릴', type: 'brand' },
        { name: 'Zestril', type: 'brand' },
    ],
    AMLODIPINE: [
        { name: '암로디핀', type: 'korean' },
        { name: 'amlodipine', type: 'english' },
        { name: 'Amlodipine', type: 'english' },
        { name: '노바스크', type: 'brand' },
        { name: 'Norvasc', type: 'brand' },
        { name: '암로디핀베실산염', type: 'korean' },
    ],
    LOSARTAN: [
        { name: '로사르탄', type: 'korean' },
        { name: 'losartan', type: 'english' },
        { name: 'Losartan', type: 'english' },
        { name: '코자', type: 'brand' },
        { name: 'Cozaar', type: 'brand' },
        { name: '로사르탄칼륨', type: 'korean' },
    ],
    METFORMIN: [
        { name: '메트포르민', type: 'korean' },
        { name: 'metformin', type: 'english' },
        { name: 'Metformin', type: 'english' },
        { name: '글루코파지', type: 'brand' },
        { name: 'Glucophage', type: 'brand' },
        { name: '메트폴민', type: 'korean' }, // 오타 대응
        { name: '메트포민', type: 'korean' }, // 오타 대응
    ],
    GLIMEPIRIDE: [
        { name: '글리메피리드', type: 'korean' },
        { name: 'glimepiride', type: 'english' },
        { name: 'Glimepiride', type: 'english' },
        { name: '아마릴', type: 'brand' },
        { name: 'Amaryl', type: 'brand' },
    ],
    OMEPRAZOLE: [
        { name: '오메프라졸', type: 'korean' },
        { name: 'omeprazole', type: 'english' },
        { name: 'Omeprazole', type: 'english' },
        { name: '로섹', type: 'brand' },
        { name: 'Losec', type: 'brand' },
        { name: '프릴로섹', type: 'brand' },
    ],
    ESOMEPRAZOLE: [
        { name: '에소메프라졸', type: 'korean' },
        { name: 'esomeprazole', type: 'english' },
        { name: 'Esomeprazole', type: 'english' },
        { name: '넥시움', type: 'brand' },
        { name: 'Nexium', type: 'brand' },
    ],
    AMOXICILLIN: [
        { name: '아목시실린', type: 'korean' },
        { name: 'amoxicillin', type: 'english' },
        { name: 'Amoxicillin', type: 'english' },
        { name: '아목실', type: 'brand' },
        { name: 'Amoxil', type: 'brand' },
        { name: '아목시실린클라불란산', type: 'korean' },
    ],
    CIPROFLOXACIN: [
        { name: '시프로플록사신', type: 'korean' },
        { name: 'ciprofloxacin', type: 'english' },
        { name: 'Ciprofloxacin', type: 'english' },
        { name: '시프로', type: 'brand' },
        { name: 'Cipro', type: 'brand' },
        { name: '시플록사신', type: 'korean' }, // 오타 대응
    ],
    LEVOTHYROXINE: [
        { name: '레보티록신', type: 'korean' },
        { name: 'levothyroxine', type: 'english' },
        { name: 'Levothyroxine', type: 'english' },
        { name: '씬지로이드', type: 'brand' },
        { name: 'Synthroid', type: 'brand' },
        { name: '레보티록신나트륨', type: 'korean' },
    ],
    SERTRALINE: [
        { name: '설트랄린', type: 'korean' },
        { name: 'sertraline', type: 'english' },
        { name: 'Sertraline', type: 'english' },
        { name: '졸로푸트', type: 'brand' },
        { name: 'Zoloft', type: 'brand' },
    ],
    FLUOXETINE: [
        { name: '플루옥세틴', type: 'korean' },
        { name: 'fluoxetine', type: 'english' },
        { name: 'Fluoxetine', type: 'english' },
        { name: '프로작', type: 'brand' },
        { name: 'Prozac', type: 'brand' },
    ],
    ZOLPIDEM: [
        { name: '졸피뎀', type: 'korean' },
        { name: 'zolpidem', type: 'english' },
        { name: 'Zolpidem', type: 'english' },
        { name: '스틸녹스', type: 'brand' },
        { name: 'Stilnox', type: 'brand' },
        { name: 'Ambien', type: 'brand' },
    ],
    ALPRAZOLAM: [
        { name: '알프라졸람', type: 'korean' },
        { name: 'alprazolam', type: 'english' },
        { name: 'Alprazolam', type: 'english' },
        { name: '자낙스', type: 'brand' },
        { name: 'Xanax', type: 'brand' },
    ],
    VITAMIN_D: [
        { name: '비타민D', type: 'korean' },
        { name: '비타민 D', type: 'korean' },
        { name: 'vitamin d', type: 'english' },
        { name: 'Vitamin D', type: 'english' },
        { name: '비타민D3', type: 'korean' },
        { name: 'cholecalciferol', type: 'english' },
        { name: '콜레칼시페롤', type: 'korean' },
    ],
    VITAMIN_K: [
        { name: '비타민K', type: 'korean' },
        { name: '비타민 K', type: 'korean' },
        { name: 'vitamin k', type: 'english' },
        { name: 'Vitamin K', type: 'english' },
        { name: '비타민K1', type: 'korean' },
        { name: '비타민K2', type: 'korean' },
        { name: '피토나디온', type: 'korean' },
    ],
    OMEGA3: [
        { name: '오메가3', type: 'korean' },
        { name: '오메가-3', type: 'korean' },
        { name: 'omega-3', type: 'english' },
        { name: 'Omega-3', type: 'english' },
        { name: '피쉬오일', type: 'korean' },
        { name: 'fish oil', type: 'english' },
        { name: 'EPA', type: 'abbreviation' },
        { name: 'DHA', type: 'abbreviation' },
        { name: '오메가쓰리', type: 'korean' },
    ],
    GINKGO: [
        { name: '은행잎추출물', type: 'korean' },
        { name: '은행잎', type: 'korean' },
        { name: 'ginkgo', type: 'english' },
        { name: 'Ginkgo Biloba', type: 'english' },
        { name: '징코빌로바', type: 'korean' },
        { name: '기넥신', type: 'brand' },
        { name: 'Ginexin', type: 'brand' },
    ],
    ST_JOHNS_WORT: [
        { name: '세인트존스워트', type: 'korean' },
        { name: "St. John's Wort", type: 'english' },
        { name: "st john's wort", type: 'english' },
        { name: '성요한풀', type: 'korean' },
        { name: '하이페리쿰', type: 'korean' },
        { name: 'Hypericum', type: 'english' },
    ],
    CALCIUM: [
        { name: '칼슘', type: 'korean' },
        { name: 'calcium', type: 'english' },
        { name: 'Calcium', type: 'english' },
        { name: '탄산칼슘', type: 'korean' },
        { name: '구연산칼슘', type: 'korean' },
        { name: 'calcium carbonate', type: 'english' },
        { name: 'calcium citrate', type: 'english' },
    ],
    GRAPEFRUIT: [
        { name: '자몽', type: 'korean' },
        { name: 'grapefruit', type: 'english' },
        { name: 'Grapefruit', type: 'english' },
        { name: '자몽주스', type: 'korean' },
        { name: 'grapefruit juice', type: 'english' },
        { name: '그레이프프루트', type: 'korean' },
    ],
};

// ============================================
// 3. 상호작용 룰 데이터
// DDI (Drug-Drug), HDI (Herb-Drug), FDI (Food-Drug)
// ============================================
interface InteractionRuleData {
    category: 'ddi' | 'hdi' | 'fdi' | 'duplication' | 'overdose';
    trigger: string;
    target: string | null;
    baseRisk: 'notice' | 'warning' | 'danger';
    liverWeight: number;
    kidneyWeight: number;
    bleedingWeight: number;
    pregnancyWeight: number;
    elderlyWeight: number;
    conclusion: string;
    reason: string;
    action: string;
    evidenceUrl?: string;
}

const interactionRules: InteractionRuleData[] = [
    // === 와파린 상호작용 (DANGER 등급) ===
    {
        category: 'ddi',
        trigger: 'WARFARIN',
        target: 'ASPIRIN',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.5,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '🚨 심각한 출혈 위험!',
        reason: '와파린과 아스피린을 함께 복용하면 출혈 위험이 크게 증가합니다. 두 약물 모두 혈액 응고를 억제하여 상승 효과가 발생합니다.',
        action: '즉시 의사 또는 약사와 상담하세요. 자가 조절하지 마세요.',
        evidenceUrl: 'https://www.drugs.com/interactions-check.php',
    },
    {
        category: 'hdi',
        trigger: 'WARFARIN',
        target: 'GINKGO',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.5,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '🚨 출혈 위험 증가!',
        reason: '은행잎 추출물은 혈액 응고를 억제하는 효과가 있어, 와파린과 함께 복용 시 출혈 위험이 증가합니다.',
        action: '은행잎 보충제 복용을 중단하고 의사와 상담하세요.',
        evidenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5871207/',
    },
    {
        category: 'hdi',
        trigger: 'WARFARIN',
        target: 'OMEGA3',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.3,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '⚠️ 출혈 위험 주의',
        reason: '고용량 오메가-3는 혈소판 응집을 억제하여 와파린의 항응고 효과를 강화할 수 있습니다.',
        action: '오메가-3 용량을 하루 2g 이하로 제한하고, 정기적으로 INR 검사를 받으세요.',
    },
    {
        category: 'hdi',
        trigger: 'WARFARIN',
        target: 'VITAMIN_K',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.0,
        conclusion: '⚠️ 와파린 효과 감소 가능',
        reason: '비타민K는 와파린의 작용을 길항합니다. 비타민K 섭취량이 급변하면 INR 수치가 불안정해질 수 있습니다.',
        action: '비타민K 섭취를 일정하게 유지하고, 보충제 복용 전 의사와 상담하세요.',
    },

    // === 자몽 상호작용 (FDI) ===
    {
        category: 'fdi',
        trigger: 'GRAPEFRUIT',
        target: 'SIMVASTATIN',
        baseRisk: 'danger',
        liverWeight: 1.5,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '🚨 근육 손상 위험!',
        reason: '자몽은 CYP3A4 효소를 억제하여 심바스타틴 혈중 농도를 최대 15배까지 증가시킬 수 있습니다. 이로 인해 횡문근융해증(근육 손상) 위험이 크게 증가합니다.',
        action: '자몽 및 자몽 주스 섭취를 완전히 피하세요.',
        evidenceUrl: 'https://www.fda.gov/consumers/consumer-updates/grapefruit-juice-and-some-drugs-dont-mix',
    },
    {
        category: 'fdi',
        trigger: 'GRAPEFRUIT',
        target: 'ATORVASTATIN',
        baseRisk: 'warning',
        liverWeight: 1.3,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '⚠️ 스타틴 부작용 주의',
        reason: '자몽이 아토르바스타틴 혈중 농도를 증가시켜 근육통, 근육 손상 위험이 높아질 수 있습니다.',
        action: '자몽 섭취를 제한하고, 근육통 발생 시 의사에게 알리세요.',
    },
    {
        category: 'fdi',
        trigger: 'GRAPEFRUIT',
        target: 'AMLODIPINE',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '⚠️ 혈압 과도 저하 가능',
        reason: '자몽이 암로디핀의 대사를 억제하여 혈중 농도가 증가하면 저혈압, 어지러움이 발생할 수 있습니다.',
        action: '자몽 섭취를 줄이고, 어지러움이 심하면 의사와 상담하세요.',
    },

    // === NSAID 상호작용 ===
    {
        category: 'ddi',
        trigger: 'IBUPROFEN',
        target: 'ASPIRIN',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.3,
        bleedingWeight: 1.5,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '⚠️ 위장관 출혈 및 아스피린 효과 감소',
        reason: '이부프로펜은 아스피린의 심장보호 효과를 감소시킬 수 있으며, 두 약물 모두 위장관 자극을 유발합니다.',
        action: '아스피린을 먼저 복용하고 30분 후에 이부프로펜을 복용하거나, 대체 진통제를 고려하세요.',
    },
    {
        category: 'ddi',
        trigger: 'IBUPROFEN',
        target: 'WARFARIN',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.5,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '🚨 출혈 위험 증가!',
        reason: 'NSAID는 위장관 출혈 위험을 높이고, 와파린의 항응고 효과와 결합하면 심각한 출혈이 발생할 수 있습니다.',
        action: '가능하면 아세트아미노펜(타이레놀)으로 대체하세요. 반드시 의사와 상담 필요.',
    },
    {
        category: 'ddi',
        trigger: 'NAPROXEN',
        target: 'LISINOPRIL',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.5,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '⚠️ 혈압약 효과 감소, 신장 기능 저하 가능',
        reason: 'NSAID는 ACE 억제제의 혈압 강하 효과를 감소시키고, 특히 신장 기능이 저하된 환자에서 급성 신부전 위험이 있습니다.',
        action: '단기간 사용만 가능. 신장질환이 있으면 다른 진통제를 사용하세요.',
    },

    // === PPI와 클로피도그렐 ===
    {
        category: 'ddi',
        trigger: 'OMEPRAZOLE',
        target: 'CLOPIDOGREL',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.0,
        conclusion: '⚠️ 클로피도그렐 효과 감소 가능',
        reason: '오메프라졸은 CYP2C19 효소를 억제하여 클로피도그렐의 활성 대사체 생성을 감소시킬 수 있습니다.',
        action: '판토프라졸(Pantoprazole)로 대체하거나 복용 시간을 12시간 이상 간격으로 분리하세요.',
    },

    // === 세인트존스워트 상호작용 ===
    {
        category: 'hdi',
        trigger: 'ST_JOHNS_WORT',
        target: 'SERTRALINE',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '🚨 세로토닌 증후군 위험!',
        reason: '세인트존스워트와 SSRI를 함께 복용하면 세로토닌이 과도하게 증가하여 세로토닌 증후군(고열, 근육경직, 혼란)이 발생할 수 있습니다.',
        action: '세인트존스워트 복용을 즉시 중단하고 의사에게 알리세요.',
    },
    {
        category: 'hdi',
        trigger: 'ST_JOHNS_WORT',
        target: 'WARFARIN',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.0,
        conclusion: '🚨 와파린 효과 크게 감소!',
        reason: '세인트존스워트는 CYP 효소를 유도하여 와파린의 대사를 촉진시키고, 항응고 효과를 크게 감소시킵니다.',
        action: '세인트존스워트 복용을 즉시 중단하세요. 혈전 위험이 증가합니다.',
    },

    // === 칼슘과 항생제 ===
    {
        category: 'hdi',
        trigger: 'CALCIUM',
        target: 'CIPROFLOXACIN',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.0,
        conclusion: '⚠️ 항생제 흡수 감소',
        reason: '칼슘이 시프로플록사신과 결합하여 약물 흡수를 50% 이상 감소시킬 수 있습니다.',
        action: '항생제 복용 2시간 전이나 6시간 후에 칼슘을 복용하세요.',
    },
    {
        category: 'hdi',
        trigger: 'CALCIUM',
        target: 'LEVOTHYROXINE',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.0,
        conclusion: '⚠️ 갑상선약 흡수 감소',
        reason: '칼슘이 레보티록신과 결합하여 흡수를 방해합니다.',
        action: '레보티록신 복용 후 최소 4시간 간격을 두고 칼슘을 복용하세요.',
    },

    // === 동일 효능군 중복 (Notice) ===
    {
        category: 'duplication',
        trigger: 'IBUPROFEN',
        target: 'NAPROXEN',
        baseRisk: 'warning',
        liverWeight: 1.0,
        kidneyWeight: 1.5,
        bleedingWeight: 1.3,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.3,
        conclusion: '⚠️ NSAID 중복 복용!',
        reason: '두 가지 NSAID를 동시에 복용하면 위장관 출혈, 신장 손상 위험이 크게 증가하며, 진통 효과는 증가하지 않습니다.',
        action: '하나의 NSAID만 선택하여 복용하세요.',
    },
    {
        category: 'duplication',
        trigger: 'OMEPRAZOLE',
        target: 'ESOMEPRAZOLE',
        baseRisk: 'notice',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.0,
        conclusion: '📌 같은 계열 약물 중복',
        reason: '오메프라졸과 에소메프라졸은 사실상 동일한 약물입니다. 중복 복용 시 과용량이 됩니다.',
        action: '하나만 복용하세요. 처방전을 확인해주세요.',
    },
    {
        category: 'duplication',
        trigger: 'SIMVASTATIN',
        target: 'ATORVASTATIN',
        baseRisk: 'warning',
        liverWeight: 1.5,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '⚠️ 스타틴 중복 복용!',
        reason: '두 가지 스타틴을 함께 복용하면 근육 손상(횡문근융해증) 및 간 손상 위험이 크게 증가합니다.',
        action: '하나의 스타틴만 복용하세요. 처방의와 상담 필요.',
    },
    {
        category: 'duplication',
        trigger: 'SERTRALINE',
        target: 'FLUOXETINE',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '🚨 SSRI 중복! 세로토닌 증후군 위험!',
        reason: '두 가지 SSRI를 동시에 복용하면 세로토닌 과다로 인한 세로토닌 증후군이 발생할 수 있습니다.',
        action: '절대 자가 조절하지 마세요. 즉시 정신건강의학과 의사와 상담하세요.',
    },

    // === 수면제/진정제 ===
    {
        category: 'ddi',
        trigger: 'ZOLPIDEM',
        target: 'ALPRAZOLAM',
        baseRisk: 'danger',
        liverWeight: 1.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.5,
        conclusion: '🚨 과도한 진정, 호흡억제 위험!',
        reason: '두 약물 모두 중추신경을 억제합니다. 함께 복용 시 과도한 졸음, 혼란, 호흡 억제, 심지어 사망에 이를 수 있습니다.',
        action: '절대 함께 복용하지 마세요. 처방의에게 즉시 알리세요.',
    },

    // === 아세트아미노펜 과량 ===
    {
        category: 'overdose',
        trigger: 'ACETAMINOPHEN',
        target: null,
        baseRisk: 'warning',
        liverWeight: 2.0,
        kidneyWeight: 1.0,
        bleedingWeight: 1.0,
        pregnancyWeight: 1.0,
        elderlyWeight: 1.2,
        conclusion: '⚠️ 아세트아미노펜 과량 복용 주의!',
        reason: '아세트아미노펜은 많은 복합제(감기약, 진통제)에 포함되어 있어 모르고 과량 복용하기 쉽습니다. 하루 4,000mg 초과 시 심각한 간 손상이 발생할 수 있습니다.',
        action: '복용 중인 모든 약의 아세트아미노펜 함량을 확인하세요. 간질환이 있으면 하루 2,000mg 이하로 제한하세요.',
    },
];

// ============================================
// 시드 실행 메인 함수
// ============================================
async function main() {
    console.log('🌱 시드 데이터 생성을 시작합니다...\n');

    // 기존 데이터 삭제 (테스트용)
    console.log('🗑️  기존 데이터 정리 중...');
    await prisma.interactionRule.deleteMany();
    await prisma.ingredientAlias.deleteMany();
    await prisma.productIngredient.deleteMany();
    await prisma.standardIngredient.deleteMany();

    // 1. 표준 성분 생성
    console.log('\n📦 표준 성분 데이터 생성 중...');
    const ingredientMap = new Map<string, string>();

    for (const ingredient of standardIngredients) {
        const created = await prisma.standardIngredient.create({
            data: {
                code: ingredient.code,
                nameKo: ingredient.nameKo,
                nameEn: ingredient.nameEn,
                category: ingredient.category,
                therapeuticGroup: ingredient.therapeuticGroup,
                maxDailyDose: ingredient.maxDailyDose,
                maxDailyUnit: ingredient.maxDailyUnit,
                description: ingredient.description,
            },
        });
        ingredientMap.set(ingredient.code, created.id);
        console.log(`  ✅ ${ingredient.nameKo} (${ingredient.code})`);
    }
    console.log(`  → 총 ${standardIngredients.length}개 성분 생성 완료`);

    // 2. 성분 별명 생성
    console.log('\n🏷️  성분 별명(Alias) 데이터 생성 중...');
    let aliasCount = 0;

    for (const [code, aliases] of Object.entries(ingredientAliases)) {
        const ingredientId = ingredientMap.get(code);
        if (!ingredientId) {
            console.warn(`  ⚠️ ${code}에 대한 표준 성분을 찾을 수 없습니다.`);
            continue;
        }

        for (let i = 0; i < aliases.length; i++) {
            const alias = aliases[i];
            try {
                await prisma.ingredientAlias.create({
                    data: {
                        standardIngredientId: ingredientId,
                        aliasName: alias.name,
                        aliasType: alias.type,
                        priority: aliases.length - i, // 앞에 있을수록 높은 우선순위
                    },
                });
                aliasCount++;
            } catch (error) {
                // 중복 별명 무시
                console.warn(`  ⚠️ 중복 별명 스킵: ${alias.name}`);
            }
        }
    }
    console.log(`  → 총 ${aliasCount}개 별명 생성 완료`);

    // 3. 상호작용 룰 생성
    console.log('\n⚡ 상호작용 룰 데이터 생성 중...');
    let ruleCount = 0;

    for (const rule of interactionRules) {
        const triggerId = ingredientMap.get(rule.trigger);
        const targetId = rule.target ? ingredientMap.get(rule.target) : null;

        if (!triggerId) {
            console.warn(`  ⚠️ 트리거 성분 ${rule.trigger}을(를) 찾을 수 없습니다.`);
            continue;
        }
        if (rule.target && !targetId) {
            console.warn(`  ⚠️ 타겟 성분 ${rule.target}을(를) 찾을 수 없습니다.`);
            continue;
        }

        await prisma.interactionRule.create({
            data: {
                category: rule.category,
                triggerIngredientId: triggerId,
                targetIngredientId: targetId,
                baseRisk: rule.baseRisk,
                liverRiskWeight: rule.liverWeight,
                kidneyRiskWeight: rule.kidneyWeight,
                bleedingRiskWeight: rule.bleedingWeight,
                pregnancyRiskWeight: rule.pregnancyWeight,
                elderlyRiskWeight: rule.elderlyWeight,
                conclusion: rule.conclusion,
                reason: rule.reason,
                action: rule.action,
                evidenceUrl: rule.evidenceUrl,
            },
        });

        const riskEmoji = rule.baseRisk === 'danger' ? '🔴' : rule.baseRisk === 'warning' ? '🟠' : '🟡';
        console.log(`  ${riskEmoji} ${rule.trigger} ${rule.target ? '↔ ' + rule.target : ''} (${rule.category})`);
        ruleCount++;
    }
    console.log(`  → 총 ${ruleCount}개 상호작용 룰 생성 완료`);

    // 4. 테스트 사용자 계정 생성
    console.log('\n👤 테스트 사용자 계정 생성 중...');

    // bcrypt로 비밀번호 해시 (test1234)
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('test1234', 12);

    const testUser = await prisma.user.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: {
            email: 'test@test.com',
            password: hashedPassword,
            profile: {
                create: {
                    name: '테스트 사용자',
                    ageBand: '30s',
                    liverIssue: false,
                    kidneyIssue: false,
                    bleedingRisk: false,
                    pregnancyLactation: false,
                },
            },
        },
    });
    console.log(`  ✅ 테스트 계정 생성: test@test.com / test1234`);

    // 테스트 사용자에게 와파린 약 등록 (시뮬레이션용)
    const warfarinId = ingredientMap.get('WARFARIN');
    if (warfarinId) {
        const warfarinStandard = await prisma.standardIngredient.findFirst({
            where: { code: 'WARFARIN' },
        });

        if (warfarinStandard) {
            await prisma.product.create({
                data: {
                    userId: testUser.id,
                    name: '쿠마딘 (와파린)',
                    type: 'medicine',
                    dosageText: '1일 1회 5mg',
                    ingredients: {
                        create: {
                            standardIngredientId: warfarinStandard.id,
                            originalName: '와파린',
                            amount: 5,
                            unit: 'mg',
                        },
                    },
                },
            });
            console.log(`  ✅ 와파린 약 등록 (시뮬레이션용)`);
        }
    }

    // 완료 메시지
    console.log('\n✨ 시드 데이터 생성이 완료되었습니다!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 표준 성분: ${standardIngredients.length}개`);
    console.log(`🏷️  성분 별명: ${aliasCount}개`);
    console.log(`⚡ 상호작용 룰: ${ruleCount}개`);
    console.log(`👤 테스트 계정: test@test.com / test1234`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ 시드 실행 중 오류 발생:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
