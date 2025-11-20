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
    <header className="fixed top-0 left-0 z-30 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3 md:px-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-7 w-7 text-primary" />
          <span className="hidden text-xl font-semibold md:block">MyTUBE</span>
        </Link>
      </div>

      {/* Desktop & Mobile Search */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-full bg-background px-2 transition-transform duration-300 md:relative md:p-0 md:h-auto md:w-auto md:flex-1 md:max-w-lg md:bg-transparent",
        isSearchOpen ? 'translate-y-0' : '-translate-y-full md:translate-y-0'
      )}>
        <form onSubmit={handleSearch} className="relative flex items-center h-full">
          <div className="relative w-full">
             <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full md:hidden"
                onClick={toggleSearch}
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
            <Input
              name="q"
              placeholder="Cari..."
              className="w-full rounded-full bg-secondary py-2 pl-10 pr-10 text-base md:text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus={isSearchOpen}
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
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-r-full bg-accent hover:bg-accent/80"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Button>
        </form>
      </div>


      <div className="flex items-center gap-1 md:gap-2">
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

    </header>
  );
}