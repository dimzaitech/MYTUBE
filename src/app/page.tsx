
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { searchVideos, type FormattedVideo } from '@/services/youtubeService';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import VideoPlayer from '@/components/videos/VideoPlayer';
import { useQueue } from '@/context/QueueContext';
import VideoGridDynamic from '@/components/videos/VideoGridDynamic';
import CategoryTabs from '@/components/videos/CategoryTabs';

const categories = [
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
  const [activeCategory, setActiveCategory] = useState('Musik');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    playNextInQueue,
    videoToPlay,
    clearVideoToPlay,
    selectedVideo,
    setSelectedVideo,
  } = useQueue();

  const searchQuery = searchParams.get('q') || '';

  const fetchVideos = useCallback(async (isNewSearch = true) => {
    if (isNewSearch) {
        setLoading(true);
        setVideos([]);
        setNextPageToken('');
    } else {
        setLoadingMore(true);
    }
    setError(null);

    try {
        const existingVideoIds = new Set(videos.map(v => v.id));
        const isSearch = !!searchQuery;
        const query = isSearch ? searchQuery : categoryQueries[activeCategory] || 'trending indonesia';
        
        const result = await searchVideos(query, 20, isNewSearch ? '' : nextPageToken, existingVideoIds);

        if (result.error) {
            throw new Error(result.error);
        }

        if (isNewSearch) {
            setVideos(result.videos);
        } else {
            setVideos(prev => [...prev, ...result.videos]);
        }
        setNextPageToken(result.nextPageToken);

    } catch (error: any) {
        console.error('Failed to fetch videos:', error);
        setError(error.message || 'Gagal mengambil data dari YouTube API.');
        if (isNewSearch) {
            setVideos([]);
        }
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
}, [searchQuery, activeCategory, videos, nextPageToken]);


  useEffect(() => {
    fetchVideos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    if (videoToPlay) {
      handleVideoClick(videoToPlay);
      clearVideoToPlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoToPlay]);

  // Infinite Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
        // Jangan muat lebih banyak jika sedang dalam proses, atau tidak ada token halaman berikutnya
        if (loading || loadingMore || !nextPageToken) return;

        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
            fetchVideos(false);
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, nextPageToken, fetchVideos]);


  const handleCategorySelect = (category: string) => {
    if (searchQuery) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      router.push(`${pathname}?${params.toString()}`);
    }
    setActiveCategory(category);
  };

  const handleVideoClick = (video: FormattedVideo) => {
    setSelectedVideo(video);
  };

  const playNextVideo = useCallback(() => {
    const nextInQueue = playNextInQueue();
    if (nextInQueue) {
      setSelectedVideo(nextInQueue);
      return;
    }
    handleClosePlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo, playNextInQueue]);

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };
  
  const handleRetry = () => {
    fetchVideos(true);
  }

  if (selectedVideo) {
    return (
      <main>
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
          onEnd={playNextVideo}
        />
      </main>
    );
  }

  return (
    <>
      <div className="mobile-only">
        <nav>
          <CategoryTabs
            categories={categories}
            selectedCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </nav>
        <main>
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
        <footer className="mobile-only">
          <p>MyTUBE &copy; 2024</p>
        </footer>
      </div>

      <div className="desktop-main desktop-only">
         <CategoryTabs 
            categories={categories}
            selectedCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
        />
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
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
