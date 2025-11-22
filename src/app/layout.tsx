
'use client';

import { useState, useEffect, type ReactNode, FormEventHandler } from 'react';
import './globals.css';
import { QueueProvider } from '@/context/QueueContext';
import Link from 'next/link';

// Helper to determine if we are on the client side
const isClient = typeof window !== 'undefined';

const devices = [
    { id: 'tv-living-room', name: 'TV Ruang Tamu', details: 'Tersambung ke WiFi'},
    { id: 'tv-bedroom', name: 'TV Kamar Tidur', details: 'Tersambung ke WiFi'},
    { id: 'tv-kitchen', name: 'TV Dapur', details: 'Tersambung ke WiFi'},
];

const getDeviceName = (deviceId: string | null) => {
    if (!deviceId) return 'Perangkat TV';
    return devices.find(d => d.id === deviceId)?.name || 'Perangkat TV';
}


export default function RootLayout({ 
  children,
  searchQuery,
  handleSearch,
}: { 
  children: ReactNode,
  searchQuery?: string,
  handleSearch?: FormEventHandler<HTMLFormElement>,
}) {
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [currentVideoToCast, setCurrentVideoToCast] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(isClient ? window.innerWidth < 1024 : false);

  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (window as any).openCastModal = (videoTitle: string) => {
      setCurrentVideoToCast(videoTitle);
      setIsCastModalOpen(true);
    };

    return () => {
      delete (window as any).openCastModal;
    }
  }, []);
  
  const handleConnect = () => {
    if (selectedDevice) {
        setIsCastModalOpen(false);
        setIsCasting(true);

        setTimeout(() => {
            alert(`Video "${currentVideoToCast}" berhasil di-cast ke ${getDeviceName(selectedDevice)}!`);
        }, 1000);

        setTimeout(() => {
            setIsCasting(false);
            alert(`Koneksi ke ${getDeviceName(selectedDevice)} terputus.`);
        }, 15000);
    } else {
        alert('Pilih perangkat TV terlebih dahulu!');
    }
  };
  
  const handleCancel = () => {
    setIsCastModalOpen(false);
    setSelectedDevice(null);
  }

  const openCastModalHandler = (title: string) => {
    setCurrentVideoToCast(title);
    setIsCastModalOpen(true);
  }

  const renderMobileLayout = () => (
     <>
        <div className="mobile-header">
            <Link href="/" className="logo">
                <i className="fab fa-youtube"></i> MyTUBE
            </Link>
            <div className="mobile-header-icons">
                <i className="fas fa-search"></i>
                <i className="fas fa-tv" onClick={() => openCastModalHandler('Layar saat ini')}></i>
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
    </>
  );

  const renderDesktopLayout = () => (
    <>
      <header>
        <div className="flex items-center gap-4">
            <i className="fas fa-bars text-xl cursor-pointer"></i>
            <Link href="/" className="logo">
              <i className="fab fa-youtube"></i>
              <span>MyTUBE</span>
            </Link>
        </div>
        
        <form className="search-container" onSubmit={handleSearch}>
            <input type="text" name="search" className="search-input" placeholder="Cari" defaultValue={searchQuery} />
            <button type="submit" className="search-button">
                <i className="fas fa-search"></i>
            </button>
        </form>
        
        <div className="header-icons">
            <i className="fas fa-video"></i>
            <i className="fas fa-bell"></i>
            <Link href="/profile">
                <i className="fas fa-user-circle"></i>
            </Link>
              <i className="fas fa-tv" id="cast-icon" onClick={() => openCastModalHandler('Layar saat ini')}></i>
            <div className="casting-indicator" id="casting-indicator" style={{ display: isCasting ? 'flex' : 'none' }}>
                <i className="fas fa-tv"></i> Casting...
            </div>
        </div>
      </header>

      <div className="flex">
        <div className="sidebar">
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
        
        <div className="main-content flex-1">
          {children}
        </div>
      </div>
    </>
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
        <script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          async
        ></script>
      </head>
      <body>
        <QueueProvider>
            {isMobile ? renderMobileLayout() : renderDesktopLayout()}

            <div 
              className="cast-modal" 
              id="cast-modal" 
              style={{ display: isCastModalOpen ? 'flex' : 'none' }}
              onClick={(e) => { if (e.target === e.currentTarget) handleCancel() }}
            >
                <div className="cast-modal-content">
                    <h2>Pilih Perangkat TV</h2>
                    <ul className="devices-list" id="devices-list">
                        {devices.map(device => (
                          <li 
                              key={device.id} 
                              className="device-item" 
                              data-device={device.id}
                              onClick={() => setSelectedDevice(device.id)}
                              style={{ background: selectedDevice === device.id ? '#404040' : ''}}
                          >
                              <i className="fas fa-tv"></i>
                              <div>
                                  <strong>{device.name}</strong>
                                  <div>{device.details}</div>
                              </div>
                          </li>
                        ))}
                    </ul>
                    <div className="cast-controls">
                        <button className="cast-btn cast-cancel" id="cast-cancel" onClick={handleCancel}>Batal</button>
                        <button className="cast-btn cast-connect" id="cast-connect" onClick={handleConnect}>Hubungkan</button>
                    </div>
                </div>
            </div>
        </QueueProvider>
      </body>
    </html>
  );
}
