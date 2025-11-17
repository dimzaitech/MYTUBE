'use client';

import { useState, useEffect } from 'react';
import VideoGrid from '@/components/videos/video-grid';
import youtubeService, {
  type FormattedVideo,
} from '@/services/youtubeService';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="relative aspect-video w-full overflow-hidden rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      let fetchedVideos: FormattedVideo[] = [];
      if (searchQuery) {
        fetchedVideos = await youtubeService.searchVideos(searchQuery);
      } else {
        fetchedVideos = await youtubeService.getTrendingVideos(12);
      }
      setVideos(fetchedVideos);
      setLoading(false);
    };

    fetchVideos();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No videos found. Your YouTube API key might be missing or invalid.</p>
      </div>
    );
  }

  return <VideoGrid videos={videos} />;
}
