'use client';

import { useState, useEffect } from 'react';
import {
  getTrendingVideos,
  searchVideos,
  type FormattedVideo,
} from '@/services/youtubeService';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import VideoGridDynamic from '@/components/videos/VideoGridDynamic';

export default function Home() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const router = useRouter();

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
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let fetchedVideos: FormattedVideo[] = [];
        if (searchQuery) {
          fetchedVideos = await searchVideos(searchQuery);
        } else {
          fetchedVideos = await getTrendingVideos(12);
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
  }, [searchQuery]);

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

      <VideoGridDynamic loading={loading} videos={videos} />
    </>
  );
}
