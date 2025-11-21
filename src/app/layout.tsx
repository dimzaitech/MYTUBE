
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { QueueProvider } from '@/context/QueueContext';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MyTUBE',
  description: 'A YouTube clone with Background Play',
};

export const viewport: Viewport = {
  themeColor: '#f9f9f9',
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
    <html lang="id">
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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          async
        ></script>
      </head>
      <body>
        <QueueProvider>
          <header>
            <Link href="/" className="logo">
                <i className="fab fa-youtube"></i>
                <span className='mobile-only'>&nbsp;MyTUBE</span>
            </Link>
            
            <div className="search-container desktop-only">
                {/* Search will be handled by page */}
            </div>
            
            <div className="header-icons">
                <i className="fas fa-video desktop-only"></i>
                <i className="fas fa-bell desktop-only"></i>
                <Link href="/profile">
                    <i className="fas fa-user-circle"></i>
                </Link>
            </div>
          </header>

          <div className="desktop-only sidebar">
              <a href="#" className="sidebar-item active">
                  <i className="fas fa-home"></i> Beranda
              </a>
              <a href="#" className="sidebar-item">
                  <i className="fas fa-fire"></i> Trending
              </a>
              <a href="#" className="sidebar-item">
                  <i className="fas fa-music"></i> Musik
              </a>
              <a href="#" className="sidebar-item">
                  <i className="fas fa-film"></i> Film & Acara TV
              </a>
              <a href="#" className="sidebar-item">
                  <i className="fas fa-broadcast-tower"></i> Siaran Langsung
              </a>
          </div>
          
          <div className="main-content">
            {children}
          </div>

        </QueueProvider>
      </body>
    </html>
  );
}
