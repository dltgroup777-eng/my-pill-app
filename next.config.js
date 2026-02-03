/** @type {import('next').NextConfig} */
const nextConfig = {
    headers: async () => [
        {
            source: '/sw.js',
            headers: [
                { key: 'Service-Worker-Allowed', value: '/' },
                { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
            ],
        },
    ],
    images: {
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
