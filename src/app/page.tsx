'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
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
import CategoryTabs from '@/components/videos/CategoryTabs';

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


function HomePageContent() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
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

  const searchQuery = searchParams.get('q');

  const fetchVideos = useCallback(
    async (isInitialLoad = true) => {
      if (isInitialLoad) {
        setLoading(true);
        setVideos([]);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const pageToken = isInitialLoad ? '' : nextPageToken;
        const existingVideoIds = new Set(
          isInitialLoad ? [] : videos.map((v) => v.id)
        );
        let result;

        if (searchQuery) {
          result = await searchVideos(searchQuery, 20, pageToken, existingVideoIds);
        } else if (activeCategory === 'Semua') {
          result = await getTrendingVideos(20, pageToken, existingVideoIds);
        } else {
          const query = categoryQueries[activeCategory];
          result = await searchVideos(query, 20, pageToken, existingVideoIds);
        }

        if (result.error) {
          throw new Error(result.error);
        }
        
        setVideos((prev) =>
          isInitialLoad ? result.videos : [...prev, ...result.videos]
        );
        setNextPageToken(result.nextPageToken);

      } catch (error: any) {
        console.error('Failed to fetch videos:', error);
        setError(error.message || 'Gagal mengambil data dari YouTube API.');
        if (isInitialLoad) setVideos([]);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [searchQuery, activeCategory, nextPageToken, videos]
  );
  
  useEffect(() => {
    if (searchQuery) {
      setActiveCategory('Semua');
    }
    fetchVideos(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    if (videoToPlay) {
      const videoIndexInQueue = queue.findIndex((v) => v.id === videoToPlay.id);
      if (videoIndexInQueue !== -1) {
        setQueue((prev) => prev.slice(videoIndexInQueue));
      }
      handleVideoClick(videoToPlay);
      clearVideoToPlay();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoToPlay, clearVideoToPlay, queue, setQueue]);


  const handleCategorySelect = (category: string) => {
    if (searchQuery) {
      router.push('/');
    }
    setActiveCategory(category);
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
    document.body.classList.add('no-scroll');
  };
  
  const playNextVideo = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo, videos, playNextInQueue]);

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    document.body.classList.remove('no-scroll');
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(false);
    }
  };

  if (selectedVideo) {
    return (
      <div className="mx-auto flex max-w-[1700px] flex-col gap-6 px-4 pt-4 lg:flex-row lg:pt-6">
        <div className="flex-1 lg:w-[calc(100%-420px)]">
          <VideoPlayer
            video={selectedVideo}
            onClose={handleClosePlayer}
            onEnd={playNextVideo}
          />
        </div>
        <div className="hidden w-full shrink-0 lg:block lg:w-[400px]">
          <RecommendationSidebar />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed top-14 left-0 z-20 w-full border-b border-border bg-background/95 py-2 backdrop-blur-sm md:py-3 ${
          searchQuery ? 'hidden' : 'block'
        }`}
      >
        <CategoryTabs
          categories={categories}
          selectedCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      <div className={`px-4 pt-16 ${!searchQuery ? 'md:pt-28' : 'md:pt-16'}`}>
        {searchQuery && (
          <div className="mb-4 flex flex-col items-start gap-2 rounded-lg bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg text-muted-foreground">
              Hasil pencarian untuk:{' '}
              <span className="font-semibold text-foreground">
                "{searchQuery}"
              </span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2 text-muted-foreground hover:bg-accent"
            >
              Hapus pencarian
            </Button>
          </div>
        )}
        <VideoGridDynamic
          loading={loading}
          loadingMore={loadingMore}
          videos={videos}
          onVideoClick={handleVideoClick}
          error={error}
          onRetry={() => fetchVideos(true)}
          isSearching={!!searchQuery}
          searchQuery={searchQuery}
        />
        {nextPageToken && !loading && !error && videos.length > 0 && (
          <div className="my-8 text-center">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="default"
              className="min-w-[200px] rounded-full bg-primary py-3 px-8 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:-translate-y-0.5"
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
