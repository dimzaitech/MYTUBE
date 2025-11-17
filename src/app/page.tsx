'use client';

import { useState, useEffect, useMemo } from 'react';
import VideoGrid from '@/components/videos/video-grid';
import {
  getTrendingVideos,
  searchVideos,
  type FormattedVideo,
} from '@/services/youtubeService';
import ApiKeyManager from '@/services/apiKeyManager';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApiStatus from '@/components/features/ApiStatus';
import ClientOnly from '@/components/ClientOnly';

function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="relative aspect-video w-full overflow-hidden rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const router = useRouter();

  // Inisialisasi apiKeyManager hanya di sisi klien
  const apiKeyManager = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const manager = new ApiKeyManager();
    manager.initialize();
    return manager;
  }, []);

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

  useEffect(() => {
    if (!apiKeyManager) {
      setLoading(true);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      try {
        let fetchedVideos: FormattedVideo[] = [];
        if (searchQuery) {
          fetchedVideos = await searchVideos(apiKeyManager, searchQuery);
        } else {
          fetchedVideos = await getTrendingVideos(apiKeyManager, 12);
        }
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]); // Kosongkan video jika terjadi error
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery, apiKeyManager]);

  return (
    <>
      <div className="mb-6 block md:hidden">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <Input
              name="q"
              placeholder="Cari..."
              className="w-full rounded-full border-2 border-border bg-background pr-16"
              defaultValue={searchQuery ?? ''}
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

      <div className="mb-4">
        <ApiStatus />
      </div>

      <ClientOnly fallback={
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
      }>
        {loading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p>
              Video tidak ditemukan. Kunci API YouTube mungkin hilang, tidak
              valid, atau kuotanya habis.
            </p>
          </div>
        )}
      </ClientOnly>
    </>
  );
}
