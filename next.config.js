/** @type {import('next').NextConfig} */
const nextConfig = {
    // PWA 관련 설정
    headers: async () => [
        {
            source: '/sw.js',
            headers: [
                { key: 'Service-Worker-Allowed', value: '/' },
                { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
            ],
        },
    ],

    // 이미지 최적화
    images: {
        domains: ['localhost'],
        unoptimized: true, // Vercel 외부 배포 시 필요
    },

    // 실험적 기능
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },

    // 빌드 설정
    typescript: {
        ignoreBuildErrors: true, // 개발 중 타입 에러 무시
    },
    eslint: {
        ignoreDuringBuilds: true, // 개발 중 린트 에러 무시
    },
};

module.exports = nextConfig;
