import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '복용약 안전 체커',
    description: '약물 상호작용을 분석하여 안전한 복용을 도와드립니다',
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
            </head>
            <body>{children}</body>
        </html>
    );
}
