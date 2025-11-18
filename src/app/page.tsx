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
  const { playNextInQueue, videoToPlay, clearVideoToPlay, playFromQueue } =
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
    router.push('/', { scroll: false });
    setActiveCategory(category);
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
    document.body.classList.add('no-scroll');
  };

  const handleClosePlayer = () => {
    const nextVideo = playNextInQueue();
    if (nextVideo) {
      setSelectedVideo(nextVideo);
      setIsPlayerOpen(true);
    } else {
      setIsPlayerOpen(false);
      setSelectedVideo(null);
      document.body.classList.remove('no-scroll');
    }
  };

  useEffect(() => {
    if (videoToPlay) {
      // Find the video in the current list to ensure all data is up-to-date
      const videoFromList = videos.find((v) => v.id === videoToPlay.id);
      handleVideoClick(videoFromList || videoToPlay);
      clearVideoToPlay();
    }
  }, [videoToPlay]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let fetchedVideos: FormattedVideo[] = [];
        if (searchQuery) {
          setActiveCategory('');
          fetchedVideos = await searchVideos(searchQuery, 24);
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
      />
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

      <div className="sticky top-0 z-20 -mx-4 -mt-4 bg-background/80 p-4 backdrop-blur-sm sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className={cn(
                  'shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition-colors',
                  {
                    'bg-primary text-primary-foreground hover:bg-primary/90':
                      activeCategory === category,
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80':
                      activeCategory !== category,
                  }
                )}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

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
    </>
  );
}
