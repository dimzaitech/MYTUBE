'use client';

import dynamic from 'next/dynamic';
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

const VideoGridDynamic = dynamic(() => import('./video-grid'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <VideoSkeleton key={i} />
      ))}
    </div>
  ),
});

export default VideoGridDynamic;
