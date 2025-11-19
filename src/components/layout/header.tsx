'use client';
import { Search, Youtube, Settings, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';

export default function Header() {
  const { toggleQueue, queue } = useQueue();

  return (
    <header className="fixed top-0 left-0 z-30 flex h-12 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3 md:h-[56px] md:px-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-6 w-6 text-red-600 md:h-7 md:w-7" />
          <span className="text-lg font-semibold md:text-xl">MyTUBE</span>
        </Link>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={toggleQueue}
          title="Daftar Antrean"
        >
          <ListMusic className="h-5 w-5" />
          <span className="sr-only">Daftar Antrean</span>
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {queue.length}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Cari">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
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