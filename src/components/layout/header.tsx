'use client';
import {
  Search,
  Youtube,
  Bell,
  Upload,
  Settings,
  ListMusic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useQueue } from '@/context/QueueContext';

export default function Header() {
  const router = useRouter();
  const { toggleQueue, queue } = useQueue();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-7 w-7 text-primary" />
          <span className="text-lg">MyTUBE</span>
        </Link>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <form onSubmit={handleSearch} className="w-full max-w-2xl">
          <div className="relative">
            <Input
              name="q"
              placeholder="Cari..."
              className="w-full rounded-full border-2 border-input bg-transparent pr-16"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute inset-y-0 right-0 h-full rounded-l-none rounded-r-full border-y-2 border-r-2 border-border bg-accent/50 hover:bg-accent"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={toggleQueue}
        >
          <ListMusic className="h-5 w-5" />
          <span className="sr-only">Daftar Antrean</span>
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {queue.length}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Upload className="h-5 w-5" />
          <span className="sr-only">Upload</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifikasi</span>
        </Button>
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/profile" title="Admin Panel">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Admin Panel</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
