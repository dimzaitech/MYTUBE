'use client';
import { Search, Youtube } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-7 w-7 text-primary" />
          <span className="text-lg">MyTUBE</span>
        </Link>
      </div>

      <div className="flex flex-1 justify-center">
        <form className="w-full max-w-md">
          <div className="relative">
            <Input
              placeholder="Search"
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

      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={userAvatar?.imageUrl}
            alt="User Avatar"
            data-ai-hint={userAvatar?.imageHint}
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
