'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { type FormattedVideo } from '@/services/youtubeService';
import { Youtube } from 'lucide-react';

function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <Skeleton className="relative aspect-video w-full overflow-hidden rounded-lg md:rounded-xl" />
      <div className="flex gap-2 md:gap-3">
        <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full md:h-9 md:w-9" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-full md:h-4" />
          <Skeleton className="h-3 w-4/5 md:h-4" />
          <Skeleton className="h-3 w-2/3 md:h-4" />
        </div>
      </div>
    </div>
  );
}

const VideoGrid = dynamic(() => import('./video-grid'), {
  ssr: false,
});

interface VideoGridDynamicProps {
  loading: boolean;
  videos: FormattedVideo[];
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoGridDynamic({
  loading,
  videos,
  onVideoClick,
}: VideoGridDynamicProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {[...Array(24)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos && videos.length > 0) {
    return <VideoGrid videos={videos} onVideoClick={onVideoClick} />;
  }

  return (
    <div className="flex h-[calc(100vh-20rem)] flex-col items-center justify-center space-y-3 text-center md:space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted md:h-24 md:w-24">
        <Youtube className="h-8 w-8 text-muted-foreground md:h-12 md:w-12" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground md:text-lg">
          Video tidak ditemukan
        </h3>
        <p className="text-sm text-muted-foreground">
          Kunci API YouTube mungkin hilang, tidak valid, atau kuotanya habis. Coba cari dengan kata kunci lain.
        </p>
      </div>
    </div>
  );
}
