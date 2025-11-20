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

export default function Home() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>('');
  const [activeCategory, setActiveCategory] = useState('Semua');

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
  
  useEffect(() => {
    // Reset category to "Semua" if there is a search query
    if (searchQuery) {
      setActiveCategory('Semua');
    }
  }, [searchQuery]);


  const handleCategorySelect = (category: string) => {
    // If a search query exists, clear it by navigating to the home page
    if (searchQuery) {
      router.push('/');
    }
    setActiveCategory(category);
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

    // If queue is empty, try to play the next video from the current grid view
    if (selectedVideo) {
      const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id);
      if (currentIndex !== -1 && currentIndex < videos.length - 1) {
        const nextVideo = videos[currentIndex + 1];
        setSelectedVideo(nextVideo);
        return;
      }
    }

    // If no more videos, close the player
    handleClosePlayer();
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    document.body.classList.remove('no-scroll');
  };

  const fetchVideos = async (pageToken = '') => {
    const isInitialLoad = pageToken === '';
    if (isInitialLoad) {
      setLoading(true);
      setVideos([]); // Clear previous videos on a new search/category select
    } else {
      setLoadingMore(true);
    }

    try {
      let result;
      if (searchQuery) {
        result = await searchVideos(searchQuery, 20, pageToken);
      } else if (activeCategory === 'Semua') {
        result = await getTrendingVideos(20, pageToken);
      } else {
        const query = categoryQueries[activeCategory];
        result = await searchVideos(query, 20, pageToken);
      }

      setVideos((prev) =>
        isInitialLoad ? result.videos : [...prev, ...result.videos]
      );
      setNextPageToken(result.nextPageToken);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      if (isInitialLoad) setVideos([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (videoToPlay) {
      // If a video from the queue is selected to play
      const videoIndexInQueue = queue.findIndex((v) => v.id === videoToPlay.id);
      if (videoIndexInQueue !== -1) {
        // Fast-forward the queue to the played video
        setQueue((prev) => prev.slice(videoIndexInQueue));
      }
      handleVideoClick(videoToPlay);
      clearVideoToPlay();
    }
  }, [videoToPlay, clearVideoToPlay, queue, setQueue]);

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory]);

  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(nextPageToken);
    }
  };

  if (selectedVideo) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-5 pt-16 lg:flex-row lg:pt-20">
        <div className="flex-1">
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
      <CategoryTabs
        categories={categories}
        selectedCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
      />

      <div className="mt-[96px] md:mt-[120px]">
        <VideoGridDynamic
          loading={loading}
          loadingMore={loadingMore}
          videos={videos}
          onVideoClick={handleVideoClick}
        />
        {nextPageToken && !loading && (
          <div className="my-6 text-center">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="gap-2"
            >
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
