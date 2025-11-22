
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { searchVideos, type FormattedVideo } from '@/services/youtubeService';
import { useSearchParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/videos/VideoPlayer';
import { useQueue } from '@/context/QueueContext';
import VideoGridDynamic from '@/components/videos/VideoGridDynamic';
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
  Semua: 'trending indonesia',
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    playNextInQueue,
    videoToPlay,
    clearVideoToPlay,
    selectedVideo,
    setSelectedVideo,
  } = useQueue();

  const searchQuery = searchParams.get('q') || '';

  const fetchVideos = useCallback(async (isNewSearch = true, token?: string) => {
      if (isNewSearch) {
          setLoading(true);
          setVideos([]);
      } else {
          setLoadingMore(true);
      }
      setError(null);

      try {
          const existingVideoIds = isNewSearch ? new Set<string>() : new Set(videos.map(v => v.id));
          const query = searchQuery || categoryQueries[activeCategory] || 'trending indonesia';
          
          const result = await searchVideos(query, 20, token, existingVideoIds);

          if (result.error) {
              throw new Error(result.error);
          }

          setVideos(prev => isNewSearch ? result.videos : [...prev, ...result.videos]);
          setNextPageToken(result.nextPageToken);

      } catch (error: any) {
          console.error('Failed to fetch videos:', error);
          setError(error.message || 'Gagal mengambil data dari YouTube API.');
          if (isNewSearch) setVideos([]);
      } finally {
          setLoading(false);
          setLoadingMore(false);
      }
  }, [searchQuery, activeCategory, videos]);


  const fetchMoreVideos = useCallback(() => {
    if (loading || loadingMore || !nextPageToken) return;
    fetchVideos(false, nextPageToken);
  }, [loading, loadingMore, nextPageToken, fetchVideos]);


  useEffect(() => {
    fetchVideos(true);
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    if (videoToPlay) {
      setSelectedVideo(videoToPlay);
      clearVideoToPlay();
    }
  }, [videoToPlay, clearVideoToPlay, setSelectedVideo]);

  // Infinite Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (selectedVideo || loading || loadingMore || !nextPageToken) return;
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        fetchMoreVideos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedVideo, loading, loadingMore, nextPageToken, fetchMoreVideos]);


  const handleCategorySelect = (category: string) => {
    if (searchQuery) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('q');
      router.push(`/?${newParams.toString()}`);
    }
    setActiveCategory(category);
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
  };

  const playNextVideo = useCallback(() => {
    const nextInQueue = playNextInQueue();
    setSelectedVideo(nextInQueue);
  }, [playNextInQueue, setSelectedVideo]);


  const handleRetry = () => {
    fetchVideos(true);
  }

  if (selectedVideo) {
    return (
      <main className="desktop-main">
         <VideoPlayer
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onEnd={playNextVideo}
          />
      </main>
    );
  }

  return (
    <>
      <CategoryTabs
          categories={categories}
          selectedCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
        />
      <main className="mobile-main">
        <VideoGridDynamic
            loading={loading}
            loadingMore={loadingMore}
            videos={videos}
            onVideoClick={handleVideoClick}
            error={error}
            onRetry={handleRetry}
            isSearching={!!searchQuery}
            searchQuery={searchQuery}
        />
      </main>
      <main className="desktop-main">
         <VideoGridDynamic
            loading={loading}
            loadingMore={loadingMore}
            videos={videos}
            onVideoClick={handleVideoClick}
            error={error}
            onRetry={handleRetry}
            isSearching={!!searchQuery}
            searchQuery={searchQuery}
        />
      </main>
    </>
  );
}

export default function Home() {
  return (
      <Suspense fallback={<div className="text-center p-8">Memuat...</div>}>
        <HomePageContent />
      </Suspense>
  )
}
