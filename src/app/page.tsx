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
import VideoPlayer from '@/components/videos/VideoPlayer';
import { useQueue } from '@/context/QueueContext';
import { cn } from '@/lib/utils';

const categories = [
  'Semua',
  'Musik',
  'Karaoke',
  'Berita',
  'Hobby',
  'Live',
  'Kuliner',
  'Film',
  'Horor',
  'Kartun',
  'Travelling',
  'Komedi',
];

const categoryQueries: Record<string, string> = {
  Musik: 'music official audio',
  Karaoke: 'karaoke lyrics',
  Berita: 'berita terbaru hari ini',
  Hobby: 'hobby DIY tutorial',
  Live: 'live streaming now',
  Kuliner: 'resep masakan mukbang',
  Film: 'movie trailer film',
  Horor: 'cerita horor scary',
  Kartun: 'cartoon animation anime',
  Travelling: 'travel vlog vacation',
  Komedi: 'stand up comedy lucu',
};

export default function Home() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedVideo, setSelectedVideo] = useState<FormattedVideo | null>(
    null
  );
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const router = useRouter();
  const { playNextInQueue, videoToPlay, clearVideoToPlay, queue, setQueue } =
    useQueue();

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

  const handleCategorySelect = (category: string) => {
    // Jika ada search query, hapus search query saat mengganti kategori
    if (searchQuery) {
      router.push('/');
    }
    setActiveCategory(category);
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
    document.body.classList.add('no-scroll');
  };

  const playNextVideo = () => {
    // 1. Try to play from the manual queue first
    const nextInQueue = playNextInQueue();
    if (nextInQueue) {
      setSelectedVideo(nextInQueue);
      setIsPlayerOpen(true);
      return;
    }

    // 2. If queue is empty, try to autoplay from the current video list
    if (selectedVideo) {
      const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id);
      if (currentIndex !== -1 && currentIndex < videos.length - 1) {
        const nextVideo = videos[currentIndex + 1];
        setSelectedVideo(nextVideo);
        setIsPlayerOpen(true);
        return;
      }
    }

    // 3. If no more videos, close the player
    handleClosePlayer();
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedVideo(null);
    document.body.classList.remove('no-scroll');
  };

  useEffect(() => {
    if (videoToPlay) {
      // Find the video in the queue, and slice the queue to start from there
      const videoIndexInQueue = queue.findIndex((v) => v.id === videoToPlay.id);
      if (videoIndexInQueue !== -1) {
        // This is tricky. When we play from queue, we should probably clear the previous items.
        setQueue((prev) => prev.slice(videoIndexInQueue));
      }
      handleVideoClick(videoToPlay);
      clearVideoToPlay();
    }
  }, [videoToPlay, clearVideoToPlay, queue, setQueue]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let fetchedVideos: FormattedVideo[] = [];
        if (searchQuery) {
          // Jika ada query pencarian, gabungkan dengan kategori
          const categoryQuery =
            activeCategory !== 'Semua' ? categoryQueries[activeCategory] : '';
          const finalQuery = `${searchQuery} ${categoryQuery}`.trim();
          fetchedVideos = await searchVideos(finalQuery, 24);
        } else if (activeCategory === 'Semua') {
          fetchedVideos = await getTrendingVideos(24);
        } else {
          const query = categoryQueries[activeCategory];
          if (query) {
            fetchedVideos = await searchVideos(query, 24);
          } else {
            fetchedVideos = await getTrendingVideos(24);
          }
        }
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery, activeCategory]);

  return (
    <>
      <VideoPlayer
        video={selectedVideo}
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
        onEnd={playNextVideo}
      />
      <div className="sticky top-16 z-20 bg-background/95 py-2 shadow-sm backdrop-blur-sm">
        <div className="mb-4 block px-4 md:hidden">
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

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 px-4 sm:px-0">
            {categories.map((category) => (
              <div
                key={category}
                role="button"
                tabIndex={0}
                onClick={() => handleCategorySelect(category)}
                onKeyDown={(e) =>
                  e.key === 'Enter' || e.key === ' '
                    ? handleCategorySelect(category)
                    : null
                }
                className={cn(
                  'shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-base font-medium transition-colors',
                  {
                    'bg-primary text-primary-foreground hover:bg-primary/90':
                      activeCategory === category,
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80':
                      activeCategory !== category,
                  }
                )}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 px-4">
        {searchQuery && (
          <div className="my-4 rounded-lg border border-blue-800 bg-blue-900/20 p-3 md:my-6 md:p-4">
            <h2 className="mb-1 text-lg font-semibold text-blue-100 md:text-xl">
              Hasil pencarian untuk: "{searchQuery}"
            </h2>
            <p className="text-sm text-blue-300">
              {activeCategory !== 'Semua'
                ? `Dalam kategori: ${activeCategory}`
                : 'Di semua kategori'}
            </p>
          </div>
        )}

        {activeCategory !== 'Semua' && !searchQuery && (
          <div className="my-4 rounded-lg border border-blue-800 bg-blue-900/20 p-3 md:my-6 md:p-4">
            <h2 className="mb-1 text-lg font-semibold text-blue-100 md:text-xl">
              Kategori: {activeCategory}
            </h2>
            <p className="text-sm text-blue-300">
              Menampilkan video yang relevan dengan {activeCategory.toLowerCase()}
            </p>
          </div>
        )}

        <VideoGridDynamic
          loading={loading}
          videos={videos}
          onVideoClick={handleVideoClick}
        />
      </div>
    </>
  );
}
