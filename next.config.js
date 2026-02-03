/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { unoptimized: true },
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    // Prisma 서버리스 환경 최적화
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('@prisma/client');
        }
        return config;
    },
};

module.exports = nextConfig;
