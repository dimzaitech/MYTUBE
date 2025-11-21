'use client';
import { Search, Youtube, Settings, X, Cast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { useEffect, useState } from 'react';
import castService from '@/services/castService';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

function HeaderContent() {
  const { selectedVideo } = useQueue();
  const [castState, setCastState] = useState('NO_DEVICES_AVAILABLE');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(urlSearchQuery);

  useEffect(() => {
    setInputValue(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCastState(castService.getCastState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCast = () => {
    castService.requestSession();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
    if (isMobileSearchOpen) {
      setIsMobileSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    setInputValue('');
    router.push('/');
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  if (selectedVideo) {
    return null; // Header disembunyikan saat video player aktif
  }

  return (
    <header className="app-header">
       <Link href="/" className="flex items-center gap-2 font-semibold">
        <Youtube className="h-7 w-7 text-primary" />
        <span className="hidden text-xl font-semibold md:block app-title">
          MyTUBE
        </span>
      </Link>
      
      <form onSubmit={handleSearch} className="search-bar">
        <input
          name="q"
          placeholder="Cari..."
          className="search-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="search-button">
          <Search className="h-5 w-5" />
        </button>
      </form>
       <div className="flex items-center gap-1">
          {castState !== 'NO_DEVICES_AVAILABLE' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleCast}
              title="Cast to TV"
            >
              <Cast className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/profile" title="Pengaturan & Kuota">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
    </header>
  );
}


export default function Header() {
  return <HeaderContent />
}
