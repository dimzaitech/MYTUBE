import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { Suspense } from 'react';
import { QueueProvider } from '@/context/QueueContext';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'MyTUBE',
  description: 'A YouTube clone with Background Play',
};

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          async
        ></script>
      </head>
      <body
        className={cn('font-body antialiased', 'youtube-player-page')}
        suppressHydrationWarning
      >
        <QueueProvider>
          <Suspense fallback={<div className="h-14 bg-background border-b border-border"></div>}>
            <Header />
          </Suspense>
          <main>{children}</main>
          <Toaster />
        </QueueProvider>
      </body>
    </html>
  );
}
