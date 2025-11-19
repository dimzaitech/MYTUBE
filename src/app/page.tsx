'use client';

import { useState, useEffect } from 'react';
import {
  getTrendingVideos,
  searchVideos,
  type FormattedVideo,
} from '@/services/youtubeService';
import { useSearchParams, useRouter } from 'next/navigation';
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

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const router = useRouter();
  const {
    playNextInQueue,
    videoToPlay,
    clearVideoToPlay,
    queue,
    setQueue,
    selectedVideo,
    setSelectedVideo,
    isQueueOpen,
    setQueueOpen,
  } = useQueue();

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
    if (searchQuery) {
      router.push('/');
    }
    setActiveCategory(category);
    setSelectedVideo(null); // Close player when changing category
    setQueueOpen(false);
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
    setQueueOpen(true);
    document.body.classList.add('no-scroll');
  };

  const playNextVideo = () => {
    const nextInQueue = playNextInQueue();
    if (nextInQueue) {
      setSelectedVideo(nextInQueue);
      setQueueOpen(true);
      return;
    }

    if (selectedVideo) {
      const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id);
      if (currentIndex !== -1 && currentIndex < videos.length - 1) {
        const nextVideo = videos[currentIndex + 1];
        setSelectedVideo(nextVideo);
        setQueueOpen(true);
        return;
      }
    }

    handleClosePlayer();
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    setQueueOpen(false);
    document.body.classList.remove('no-scroll');
  };

  useEffect(() => {
    if (videoToPlay) {
      const videoIndexInQueue = queue.findIndex((v) => v.id === videoToPlay.id);
      if (videoIndexInQueue !== -1) {
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
          const categoryQuery =
            activeCategory !== 'Semua' ? categoryQueries[activeCategory] : '';
          const finalQuery = `${searchQuery} ${categoryQuery}`.trim();
          fetchedVideos = await searchVideos(finalQuery, 24);
        } else if (activeCategory === 'Semua') {
          fetchedVideos = await getTrendingVideos(24);
        } else {
          const query = categoryQueries[activeCategory];
          fetchedVideos = await searchVideos(query, 24);
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
      {selectedVideo ? (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
          onEnd={playNextVideo}
        />
      ) : (
        <>
          <div className="fixed top-12 left-0 z-20 w-full border-b border-border bg-background/95 py-2 backdrop-blur-sm md:top-[56px] md:py-3">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex gap-2 px-3 md:gap-3 md:px-4">
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
                      'shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors md:px-4 md:py-2',
                      {
                        'bg-primary text-primary-foreground':
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

          <div className="mt-[96px] md:mt-[120px]">
            <VideoGridDynamic
              loading={loading}
              videos={videos}
              onVideoClick={handleVideoClick}
            />
          </div>
        </>
      )}
    </>
  );
}
