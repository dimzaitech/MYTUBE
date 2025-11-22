
'use client';

import { useState, useEffect, type ReactNode, type FormEventHandler } from 'react';
import './globals.css';
import { QueueProvider } from '@/context/QueueContext';
import Link from 'next/link';

// Helper to determine if we are on the client side
const isClient = typeof window !== 'undefined';

export default function RootLayout({ 
  children,
}: { 
  children: ReactNode,
}) {
  const [isMobile, setIsMobile] = useState(isClient ? window.innerWidth < 1024 : true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    // For now, just log it. We'll implement search routing later.
    console.log("Search Query:", query);
    // In a real app, you'd likely do:
    // router.push(`/?q=${encodeURIComponent(query)}`);
  };


  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMobileLayout = () => (
     <div className="mobile-container">
        <header className="mobile-header">
            <Link href="/" className="logo">
                <i className="fab fa-youtube"></i>
                <span>MyTUBE</span>
            </Link>
            <div className="mobile-header-icons">
                <i className="fas fa-cast"></i>
                <i className="fas fa-bell"></i>
                <i className="fas fa-search"></i>
            </div>
        </header>

        {/* The main content including categories is now passed as children */}
        {children}

        <nav className="mobile-nav">
            <Link href="/" className="mobile-nav-item active">
                <i className="fas fa-home"></i>
                <span>Beranda</span>
            </Link>
            <a href="#" className="mobile-nav-item">
                <i className="fas fa-fire"></i>
                <span>Trending</span>
            </a>
            <a href="#" className="mobile-nav-item">
                 <i className="fas fa-play-circle"></i>
                <span>Subscription</span>
            </a>
            <Link href="/profile" className="mobile-nav-item">
                <i className="fas fa-user"></i>
                 <span>Kamu</span>
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
        <aside className="desktop-sidebar">
            <div className="desktop-sidebar-content">
                <div className="sidebar-section">
                    <a href="#" className="sidebar-item active">
                        <i className="fas fa-home"></i> <span>Beranda</span>
                    </a>
                    <a href="#" className="sidebar-item">
                        <i className="fas fa-fire"></i> <span>Trending</span>
                    </a>
                    <a href="#" className="sidebar-item">
                        <i className="fas fa-play-circle"></i> <span>Langganan</span>
                    </a>
                </div>
                <div className="sidebar-section">
                     <a href="#" className="sidebar-item">
                        <i className="fas fa-history"></i> <span>Histori</span>
                    </a>
                    <a href="#" className="sidebar-item">
                        <i className="fas fa-play-circle"></i> <span>Video Anda</span>
                    </a>
                     <a href="#" className="sidebar-item">
                        <i className="fas fa-clock"></i> <span>Tonton Nanti</span>
                    </a>
                </div>
            </div>
        </aside>

        <div className="desktop-main-area">
            <header className="desktop-header">
                 <form className="desktop-search" onSubmit={handleSearch}>
                    <input 
                      type="text" 
                      name="search" 
                      className="desktop-search-input" 
                      placeholder="Cari" 
                      defaultValue={searchQuery}
                    />
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
            
            {/* The main content including categories is now passed as children */}
            {children}
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
