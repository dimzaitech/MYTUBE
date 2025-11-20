'use client';
import { Search, Youtube, Settings, ListMusic, Cast, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { useEffect, useState } from 'react';
import castService from '@/services/castService';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '../ui/input';

export default function Header() {
  const { selectedVideo, setSelectedVideo } = useQueue();
  const [castState, setCastState] = useState('NO_DEVICES_AVAILABLE');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const interval = setInterval(() => {
      setCastState(castService.getCastState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCast = () => {
    castService.requestSession();
  };

  const handleBack = () => {
    setSelectedVideo(null);
    document.body.classList.remove('no-scroll');
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
     if (isSearchOpen) {
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  if (selectedVideo) {
    return (
       <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3 md:h-[56px] md:px-4">
        <div className='flex items-center gap-2'>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleBack} title="Kembali">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Kembali</span>
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Youtube className="h-6 w-6 text-primary md:h-7 md:w-7" />
                <span className="hidden text-lg font-semibold md:block md:text-xl">MyTUBE</span>
            </Link>
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
           <Button variant="ghost" size="icon" asChild className="h-9 w-9">
             <Link href="/profile" title="Pengaturan & Kuota">
               <Settings className="h-5 w-5" />
               <span className="sr-only">Pengaturan & Kuota</span>
             </Link>
           </Button>
         </div>
       </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 z-30 flex h-12 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3 md:h-[56px] md:px-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-6 w-6 text-primary md:h-7 md:w-7" />
          <span className="text-lg font-semibold md:text-xl">MyTUBE</span>
        </Link>
      </div>

      <div className="hidden flex-1 max-w-md mx-4 md:block">
        <form onSubmit={handleSearch}>
            <div className="relative">
                <Input name="q" placeholder="Cari..." className="bg-secondary pr-10" defaultValue={searchQuery} />
                <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                    <Search className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
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
              <form onSubmit={handleSearch}>
                  <div className="relative">
                      <Input name="q" placeholder="Cari..." className="bg-secondary pr-10" defaultValue={searchQuery} />
                      <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                          <Search className="h-5 w-5 text-muted-foreground" />
                      </Button>
                  </div>
              </form>
          </div>
      )}
    </header>
  );
}
