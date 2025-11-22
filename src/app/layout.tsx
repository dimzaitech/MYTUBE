
'use client';

import { useState, useEffect, type ReactNode, FormEventHandler } from 'react';
import './globals.css';
import { QueueProvider } from '@/context/QueueContext';
import Link from 'next/link';

// Helper to determine if we are on the client side
const isClient = typeof window !== 'undefined';

export default function RootLayout({ 
  children,
  searchQuery,
  handleSearch,
}: { 
  children: ReactNode,
  searchQuery?: string,
  handleSearch?: FormEventHandler<HTMLFormElement>,
}) {
  const [isMobile, setIsMobile] = useState(isClient ? window.innerWidth < 1024 : true);

  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMobileLayout = () => (
     <div className="mobile-container">
        <div className="mobile-header">
            <Link href="/" className="logo">
                <i className="fab fa-youtube"></i> MyTUBE
            </Link>
            <div className="mobile-header-icons">
                <i className="fas fa-search"></i>
                <i className="fas fa-bell"></i>
                 <Link href="/profile">
                    <i className="fas fa-user-circle"></i>
                </Link>
            </div>
        </div>
        <main className="mobile-main">
          {children}
        </main>
        <nav className="mobile-nav">
            <Link href="/" className="mobile-nav-item active">
                <i className="fas fa-home"></i>
                <span>Beranda</span>
            </Link>
            <a href="#" className="mobile-nav-item">
                <i className="fas fa-compass"></i>
                <span>Shorts</span>
            </a>
            <a href="#" className="mobile-nav-item">
                <i className="fas fa-plus-circle" style={{ fontSize: '24px' }}></i>
            </a>
            <a href="#" className="mobile-nav-item">
                <i className="fas fa-folder-play"></i>
                <span>Langganan</span>
            </a>
            <Link href="/profile" className="mobile-nav-item">
                <i className="fas fa-user-circle"></i>
                 <span>Profil</span>
            </Link>
        </nav>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="desktop-container">
        <div className="logo-container">
             <Link href="/" className="logo">
              <i className="fab fa-youtube"></i>
              <span>MyTUBE</span>
            </Link>
        </div>
        <header className="desktop-header">
            <form className="desktop-search" onSubmit={handleSearch}>
                <input type="text" name="search" className="desktop-search-input" placeholder="Cari" defaultValue={searchQuery} />
                <button type="submit" className="desktop-search-button">
                    <i className="fas fa-search"></i>
                </button>
            </form>
            <div className="desktop-header-icons">
                <i className="fas fa-video"></i>
                <i className="fas fa-bell"></i>
                <Link href="/profile">
                   <div className="user-avatar"></div>
                </Link>
            </div>
        </header>

        <div className="desktop-layout">
            <div className="desktop-sidebar">
                <div className="sidebar-section">
                    <a href="#" className="sidebar-item active">
                        <i className="fas fa-home"></i> Beranda
                    </a>
                    <a href="#" className="sidebar-item">
                        <i className="fas fa-fire"></i> Trending
                    </a>
                    <a href="#" className="sidebar-item">
                        <i className="fas fa-folder-play"></i> Langganan
                    </a>
                </div>
                <div className="sidebar-section">
                     <a href="#" className="sidebar-item">
                        <i className="fas fa-history"></i> Histori
                    </a>
                    <a href="#" className="sidebar-item">
                        <i className="fas fa-play-circle"></i> Video Anda
                    </a>
                     <a href="#" className="sidebar-item">
                        <i className="fas fa-clock"></i> Tonton Nanti
                    </a>
                </div>
            </div>
            
            <div className="desktop-main">
              {children}
            </div>
        </div>
    </div>
  );

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
      </head>
      <body>
        <QueueProvider>
            {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        </QueueProvider>
      </body>
    </html>
  );
}
