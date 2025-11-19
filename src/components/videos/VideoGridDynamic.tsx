'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { type FormattedVideo } from '@/services/youtubeService';
import { Youtube } from 'lucide-react';

function VideoSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="relative aspect-video w-full" />
      <div className="flex gap-3 p-3">
        <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
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
  loadingMore?: boolean;
  videos: FormattedVideo[];
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoGridDynamic({
  loading,
  loadingMore = false,
  videos,
  onVideoClick,
}: VideoGridDynamicProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos && videos.length > 0) {
    return (
      <>
        <VideoGrid videos={videos} onVideoClick={onVideoClick} />
        {loadingMore && (
           <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
             {[...Array(4)].map((_, i) => (
               <VideoSkeleton key={`loader-${i}`} />
             ))}
           </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Youtube className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-foreground">
          Video tidak ditemukan
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Kunci API YouTube mungkin hilang atau kuotanya habis. Coba cari dengan kata kunci lain.
        </p>
      </div>
    </div>
  );
}
