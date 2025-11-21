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
import { Search, Settings, Cast } from 'lucide-react';

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
  const [inputValue, setInputValue] = useState(searchQuery);

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
    [searchQuery, activeCategory] 
  );
  
  useEffect(() => {
    fetchVideos(true);
  }, [fetchVideos]);
  
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

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
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  if (selectedVideo) {
    return (
      <div className="main-content" style={{marginTop: '20px', padding: '0 16px', maxWidth: '900px'}}>
          <VideoPlayer
            video={selectedVideo}
            onClose={handleClosePlayer}
            onEnd={playNextVideo}
          />
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">MyTUBE</h1>
          </div>
          
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Cari"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="search-input"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="search-button">
              <Search size={20} />
            </button>
          </form>

          <div className="header-icons">
            <button className="cast-button" title="Cast to TV">
              <Cast size={24}/>
            </button>
            <a href="/profile" className="profile-link" title="Pengaturan & Kuota">
              <Settings size={24} />
            </a>
          </div>
        </div>
      </header>
      
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

      <main className="main-content">
        {loading && <p style={{padding: '16px'}}>Memuat video...</p>}
        {error && <p style={{padding: '16px', color: 'red'}}>Error: {error}</p>}
        {!loading && !error && (
          <>
            <div className="video-grid">
              <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
            </div>
            
            {videos.length > 0 && nextPageToken && (
              <div className="load-more-section">
                <button onClick={handleLoadMore} disabled={loadingMore} className="load-more-btn">
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
             {videos.length === 0 && !searchQuery && (
              <div style={{textAlign: 'center', padding: '40px'}}>Tidak ada video trending.</div>
            )}
            {videos.length === 0 && searchQuery && (
              <div style={{textAlign: 'center', padding: '40px'}}>Tidak ada hasil untuk &quot;{searchQuery}&quot;.</div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{padding: '32px', textAlign: 'center'}}>Memuat...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
