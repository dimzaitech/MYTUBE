
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { type FormattedVideo } from '@/services/youtubeService';
import { Youtube } from 'lucide-react';
import { Button } from '../ui/button';

function VideoSkeleton() {
  return (
    <div className="mobile-video-item">
      <Skeleton className="mobile-thumbnail" />
      <div className="mobile-video-info">
        <Skeleton className="mobile-channel-avatar" />
        <div className="flex-1 space-y-2">
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
  error?: string | null;
  onRetry?: () => void;
  isSearching?: boolean;
  searchQuery?: string | null;
}

export default function VideoGridDynamic({
  loading,
  loadingMore = false,
  videos,
  onVideoClick,
  error,
  onRetry,
  isSearching = false,
  searchQuery = '',
}: VideoGridDynamicProps) {
  if (loading) {
    return (
      <div className="video-grid mobile-video-grid">
        {[...Array(8)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
     return (
       <div className="flex h-[calc(100vh-300px)] flex-col items-center justify-center space-y-4 text-center">
         <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
           <Youtube className="h-12 w-12 text-destructive" />
         </div>
         <div className="space-y-2">
           <h3 className="text-lg font-medium text-foreground">
             Gagal Memuat Video
           </h3>
           <p className="max-w-xs text-sm text-muted-foreground">
             {error}
           </p>
           {onRetry && (
            <Button onClick={onRetry} variant="outline">Coba Lagi</Button>
           )}
         </div>
       </div>
     );
  }

  if (videos && videos.length > 0) {
    return (
      <>
        <div className="video-grid mobile-video-grid desktop-video-grid">
           <VideoGrid videos={videos} onVideoClick={onVideoClick} />
        </div>
        {loadingMore && (
           <div className="video-grid mobile-video-grid mt-4">
             {[...Array(4)].map((_, i) => (
               <VideoSkeleton key={`loader-${i}`} />
             ))}
           </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-[calc(100vh-300px)] flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Youtube className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-foreground">
          {isSearching ? `Tidak ada hasil untuk "${searchQuery}"` : "Video tidak ditemukan"}
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Coba cari dengan kata kunci lain atau periksa kunci API YouTube Anda.
        </p>
      </div>
    </div>
  );
}
