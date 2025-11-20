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

export default function Header() {
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
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
    <header className="sticky top-0 z-30 flex h-auto w-full flex-col border-b border-border bg-background px-3 py-3 md:h-14 md:flex-row md:items-center md:justify-between md:px-4 md:py-2">
      <div className="flex w-full items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 md:order-1">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Youtube className="h-7 w-7 text-primary" />
            <span className="hidden text-xl font-semibold md:block">
              MyTUBE
            </span>
          </Link>
        </div>

        {/* Mobile Search Toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleMobileSearch}
            title="Cari"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Cari</span>
          </Button>
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

        {/* Desktop Icons */}
        <div className="hidden items-center gap-1 md:order-3 md:flex">
          {castState !== 'NO_DEVICES_AVAILABLE' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleCast}
              title="Cast to TV"
            >
              <Cast className="h-5 w-5" />
              <span className="sr-only">Cast to TV</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/profile" title="Pengaturan & Kuota">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Pengaturan & Kuota</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          'mt-3 w-full md:order-2 md:mx-4 md:mt-0 md:flex md:max-w-2xl md:flex-1',
          isMobileSearchOpen ? 'block' : 'hidden'
        )}
      >
        <form onSubmit={handleSearch} className="relative flex w-full">
          <Input
            name="q"
            placeholder="Cari..."
            className="w-full rounded-full bg-secondary py-2 pl-4 pr-10 text-base md:text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-10 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
              onClick={handleClearSearch}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-12 rounded-r-full bg-accent hover:bg-accent/80"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Button>
        </form>
      </div>
    </header>
  );
}
