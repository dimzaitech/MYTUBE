'use client';
import { Search, Youtube, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { useEffect, useState } from 'react';
import castService from '@/services/castService';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '../ui/input';

export default function Header() {
  const { selectedVideo } = useQueue();
  const [castState, setCastState] = useState('NO_DEVICES_AVAILABLE');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    if (isSearchOpen) {
      setIsSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    setInputValue('');
    router.push('/');
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  if (selectedVideo) {
    return null; // Header disembunyikan saat video player aktif
  }

  return (
    <header className="fixed top-0 left-0 z-30 flex h-14 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3 md:px-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-7 w-7 text-primary" />
          <span className="hidden text-xl font-semibold md:block">MyTUBE</span>
        </Link>
      </div>

      <div className="hidden flex-1 mx-auto max-w-lg md:block">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Cari..."
              className="bg-secondary pl-10 pr-10 rounded-full"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                onClick={handleClearSearch}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-accent rounded-r-full hover:bg-accent/80"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
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
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={toggleSearch}
          title="Cari"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Cari</span>
        </Button>
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/profile" title="Pengaturan & Kuota">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Pengaturan & Kuota</span>
          </Link>
        </Button>
      </div>

      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-background p-2 border-b md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Input
                name="q"
                placeholder="Cari..."
                className="bg-secondary pr-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  onClick={handleClearSearch}
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              )}
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
