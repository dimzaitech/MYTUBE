'use client';
import { Search, Youtube, Bell, Upload, Menu, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useSidebar } from '../ui/sidebar';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-7 w-7 text-primary" />
          <span className="text-lg">MyTUBE Premium</span>
        </Link>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="relative">
            <Input
              name="q"
              placeholder="Cari..."
              className="w-full rounded-full border-2 border-border bg-background pr-16"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute inset-y-0 right-0 h-full rounded-l-none rounded-r-full border-y-2 border-r-2 border-border bg-accent hover:bg-accent/80"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Upload className="h-5 w-5" />
          <span className="sr-only">Upload</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifikasi</span>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Admin Panel</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
