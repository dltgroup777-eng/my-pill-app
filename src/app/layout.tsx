import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
    title: '복용약 안전 체커 | 약물 상호작용 분석',
    description: '복용 중인 약과 영양제의 상호작용을 10초 내 분석하여 안전한 복용을 도와드립니다.',
    keywords: ['약물 상호작용', '영양제', '복용 안전', '건강 관리', 'PWA'],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: '약안전',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: [
            { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
        apple: [
            { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
        ],
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
        { media: '(prefers-color-scheme: dark)', color: '#0a1628' },
    ],
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <head>
                {/* iOS Safari 호환성 */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="약안전" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

                {/* 안드로이드 Chrome 호환성 */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="application-name" content="약안전" />

                {/* 스플래시 스크린 */}
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/apple-splash-1170-2532.png"
                    media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
                />
            </head>
            <body>
                {children}
                <ServiceWorkerRegistration />
            </body>
        </html>
    );
}
