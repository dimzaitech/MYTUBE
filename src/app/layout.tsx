
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import './globals.css';
import { QueueProvider } from '@/context/QueueContext';
import Link from 'next/link';

const devices = [
    { id: 'tv-living-room', name: 'TV Ruang Tamu', details: 'Tersambung ke WiFi'},
    { id: 'tv-bedroom', name: 'TV Kamar Tidur', details: 'Tersambung ke WiFi'},
    { id: 'tv-kitchen', name: 'TV Dapur', details: 'Tersambung ke WiFi'},
];

const getDeviceName = (deviceId: string | null) => {
    if (!deviceId) return 'Perangkat TV';
    return devices.find(d => d.id === deviceId)?.name || 'Perangkat TV';
}


export default function RootLayout({ children }: { children: ReactNode }) {
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [currentVideoToCast, setCurrentVideoToCast] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

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
            <div className="flex items-center gap-4">
               <i className="fas fa-bars text-xl desktop-only cursor-pointer"></i>
               <Link href="/" className="logo">
                  <i className="fab fa-youtube"></i>
                  <span className='hidden lg:block'>&nbsp;MyTUBE</span>
               </Link>
            </div>
            
            <div className="search-container hidden sm:flex">
                {/* Search will be handled by page */}
            </div>
            
            <div className="header-icons">
                <i className="fas fa-search sm:hidden"></i>
                <i className="fas fa-video hidden sm:block"></i>
                <i className="fas fa-bell hidden sm:block"></i>
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
            <div className="sidebar hidden md:block">
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
