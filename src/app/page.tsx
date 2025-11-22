
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
    async () => {
      setLoading(true);
      setVideos([]);
      setError(null);

      try {
        const existingVideoIds = new Set<string>();
        let result;

        if (searchQuery) {
          result = await searchVideos(searchQuery, 20, '', existingVideoIds);
        } else if (activeCategory === 'Semua') {
          result = await getTrendingVideos(20, '', existingVideoIds);
        } else {
          const query = categoryQueries[activeCategory];
          result = await searchVideos(query, 20, '', existingVideoIds);
        }

        if (result.error) {
          throw new Error(result.error);
        }
        
        setVideos(result.videos);

      } catch (error: any) {
        console.error('Failed to fetch videos:', error);
        setError(error.message || 'Gagal mengambil data dari YouTube API.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, activeCategory] 
  );
  
  useEffect(() => {
    fetchVideos();
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
      {/* Mobile Search & Nav */}
      <div className="md:hidden">
        <form className="search-container" style={{ padding: '0 16px 16px', margin: 0, width: '100%'}} onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Cari"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete='off'
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
        </form>
        <nav>
          <ul>
            {categories.map(category => (
              <li key={category}>
                <a 
                  href="#"
                  className={activeCategory === category ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategorySelect(category)
                  }}
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop Nav */}
      <nav className="nav-desktop hidden md:block">
        <ul>
          {categories.map(category => (
            <li key={category}>
              <a 
                href="#"
                className={activeCategory === category ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleCategorySelect(category)
                }}
              >
                {category}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        {loading && <p>Memuat video...</p>}
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
        {!loading && !error && (
          <>
            <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
            
            {videos.length === 0 && !searchQuery && (
              <div>Tidak ada video trending.</div>
            )}
            {videos.length === 0 && searchQuery && (
              <div>Tidak ada hasil untuk &quot;{searchQuery}&quot;.</div>
            )}
          </>
        )}
      </main>
      
      <footer className="md:hidden">
          <p>MyTUBE &copy; 2024</p>
      </footer>
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
