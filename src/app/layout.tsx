import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { Suspense } from 'react';
import { QueueProvider } from '@/context/QueueContext';
import QueueDrawer from '@/components/queue/QueueDrawer';

export const metadata: Metadata = {
  title: 'MyTUBE',
  description: 'A YouTube clone with Background Play',
  manifest: '/manifest.json',
  themeColor: '#ff0000',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />

        {/* Enhanced PWA meta tags */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="screen-orientation" content="portrait" />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />

        {/* iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="MyTUBE" />

        {/* Android specific */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ff0000" />

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

        {/* Cast SDK */}
        <script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          async
        ></script>

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <QueueProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1">
              <main className="flex-1">
                <Suspense fallback={<div>Memuat...</div>}>{children}</Suspense>
              </main>
              <QueueDrawer />
            </div>
          </div>
          <Toaster />
        </QueueProvider>
        {/* Enhanced service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      
                      // Check for background sync support
                      if ('sync' in registration) {
                        console.log('Background Sync supported');
                      }
                      
                    })
                    .catch(function(error) {
                      console.log('ServiceWorker registration failed: ', error);
                    });
                });
              }
              
              // Screen orientation support detection
              if (screen.orientation) {
                console.log('Screen Orientation API supported');
              } else {
                console.log('Screen Orientation API not supported');
              }
              
              // Wake Lock API support
              if ('wakeLock' in navigator) {
                console.log('Wake Lock API supported');
              } else {
                console.log('Wake Lock API not supported');
              }
              
              // Media Session API support
              if ('mediaSession' in navigator) {
                console.log('Media Session API supported');
              } else {
                console.log('Media Session API not supported');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
