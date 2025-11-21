'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  getTrendingVideos,
  searchVideos,
  type FormattedVideo,
} from '@/services/youtubeService';
import { useSearchParams, useRouter } from 'next/navigation';
import VideoGrid from '@/components/videos/video-grid';
import VideoPlayer from '@/components/videos/VideoPlayer';
import { useQueue } from '@/context/QueueContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, activeCategory] 
  );
  
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
      </div>
    );
  }

  return (
    <>
      <Header />
      
      {/* CATEGORIES */}
      <div className="categories-container">
        <div className="categories-scroll">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {loading && <p className='p-4'>Memuat video...</p>}
        {error && <p className='p-4 text-red-500'>Error: {error}</p>}
        {!loading && !error && (
          <>
            <div className="video-grid">
              <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
            </div>
            
            {nextPageToken && (
              <div className="load-more-section">
                <button onClick={handleLoadMore} disabled={loadingMore} className="load-more-btn">
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
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
