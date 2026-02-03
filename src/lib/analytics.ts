// Google Analytics 4 이벤트 추적 유틸리티

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// 페이지뷰 추적
export function pageview(url: string) {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
        window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
    }
}

// 이벤트 추적
export function event(action: string, params?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, params);
    }
}

// 주요 이벤트 헬퍼
export const analytics = {
    // 사용자 이벤트
    userRegistered: () => event('sign_up', { method: 'email' }),
    userLoggedIn: () => event('login', { method: 'email' }),

    // 스캔 이벤트
    scanStarted: () => event('scan_started'),
    scanCompleted: (ingredientCount: number, resultCount: number) =>
        event('scan_completed', { ingredient_count: ingredientCount, result_count: resultCount }),

    // 위험 노출 이벤트
    dangerExposed: (ruleId: string, trigger: string) =>
        event('danger_exposed', { rule_id: ruleId, trigger }),

    // 결제 이벤트
    premiumCTAShown: () => event('premium_cta_shown'),
    premiumCTAClicked: () => event('premium_cta_clicked'),
    paymentStarted: () => event('begin_checkout'),
    paymentCompleted: (value: number) => event('purchase', { value, currency: 'KRW' }),

    // PDF 리포트
    reportGenerated: () => event('report_generated'),
};
