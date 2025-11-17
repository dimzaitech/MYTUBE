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
    // Clear search query from URL when a category is clicked
    router.push('/', { scroll: false });
    setActiveCategory(category);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let fetchedVideos: FormattedVideo[] = [];
        // Priority 1: Direct search query from URL
        if (searchQuery) {
          setActiveCategory(''); // Reset category when searching
          fetchedVideos = await searchVideos(searchQuery, 24);
        }
        // Priority 2: Active category is 'Semua' (All)
        else if (activeCategory === 'Semua') {
          fetchedVideos = await getTrendingVideos(24);
        }
        // Priority 3: Active category is anything else
        else {
          const query = categoryQueries[activeCategory];
          if (query) {
            fetchedVideos = await searchVideos(query, 24);
          } else {
            // Fallback to trending if category query is not found
            fetchedVideos = await getTrendingVideos(24);
          }
        }
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]); // Clear videos on error
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery, activeCategory]);

  return (
    <>
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

      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-4 border-b bg-background/80 p-4 backdrop-blur-sm sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="overflow-x-auto">
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'secondary'}
                size="sm"
                className="h-8 shrink-0 rounded-full px-3 py-1.5 transition-colors md:px-4 md:py-2"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {activeCategory !== 'Semua' && !searchQuery && (
         <div className="mb-4 rounded-lg border border-blue-800 bg-blue-900/20 p-3 md:mb-6 md:p-4">
            <h2 className="mb-1 text-lg font-semibold text-blue-100 md:text-xl">
                Kategori: {activeCategory}
            </h2>
            <p className="text-sm text-blue-300">
                Menampilkan video yang relevan dengan {activeCategory.toLowerCase()}
            </p>
         </div>
      )}


      <VideoGridDynamic loading={loading} videos={videos} />
    </>
  );
}
