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
import RecommendationSidebar from '@/components/queue/RecommendationSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>('');
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
    setVideos([]);
    setNextPageToken('');
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
    document.body.classList.add('no-scroll');
  };

  const playNextVideo = () => {
    const nextInQueue = playNextInQueue();
    if (nextInQueue) {
      setSelectedVideo(nextInQueue);
      return;
    }

    if (selectedVideo) {
      const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id);
      if (currentIndex !== -1 && currentIndex < videos.length - 1) {
        const nextVideo = videos[currentIndex + 1];
        setSelectedVideo(nextVideo);
        return;
      }
    }

    handleClosePlayer();
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    document.body.classList.remove('no-scroll');
  };
  
  const fetchVideos = async (pageToken = '') => {
      const isInitialLoad = pageToken === '';
      if(isInitialLoad) setLoading(true);
      else setLoadingMore(true);

      try {
        let result;
        if (searchQuery) {
          const categoryQuery =
            activeCategory !== 'Semua' ? categoryQueries[activeCategory] : '';
          const finalQuery = `${searchQuery} ${categoryQuery}`.trim();
          result = await searchVideos(finalQuery, 20, pageToken);
        } else if (activeCategory === 'Semua') {
          result = await getTrendingVideos(20, pageToken);
        } else {
          const query = categoryQueries[activeCategory];
          result = await searchVideos(query, 20, pageToken);
        }
        
        setVideos(prev => isInitialLoad ? result.videos : [...prev, ...result.videos]);
        setNextPageToken(result.nextPageToken);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        if (isInitialLoad) setVideos([]);
      } finally {
        if(isInitialLoad) setLoading(false);
        else setLoadingMore(false);
      }
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
    fetchVideos();
  }, [searchQuery, activeCategory]);
  
  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
        fetchVideos(nextPageToken);
    }
  }

  if (selectedVideo) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-5 lg:flex-row player-content">
        <div className="flex-1 main-content">
          <VideoPlayer
            video={selectedVideo}
            onClose={handleClosePlayer}
            onEnd={playNextVideo}
          />
        </div>
        <div className="hidden w-full shrink-0 recommendations-sidebar lg:block lg:w-[400px]">
          <RecommendationSidebar />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-12 left-0 z-20 w-full border-b border-border bg-background/95 py-2 backdrop-blur-sm md:top-[56px] md:py-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="inline-flex gap-2 px-3 md:gap-3 md:px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors md:px-4 md:py-2 ${
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[96px] md:mt-[120px]">
        <VideoGridDynamic
          loading={loading}
          loadingMore={loadingMore}
          videos={videos}
          onVideoClick={handleVideoClick}
        />
        {nextPageToken && !loading && (
          <div className='my-6 text-center'>
            <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" className='gap-2'>
              {loadingMore ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                'Muat Lebih Banyak'
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
