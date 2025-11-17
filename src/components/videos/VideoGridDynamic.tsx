'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { type FormattedVideo } from '@/services/youtubeService';

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

const VideoGrid = dynamic(() => import('./video-grid'), {
  ssr: false,
});

interface VideoGridDynamicProps {
  loading: boolean;
  videos: FormattedVideo[];
}

export default function VideoGridDynamic({ loading, videos }: VideoGridDynamicProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos && videos.length > 0) {
    return <VideoGrid videos={videos} />;
  }

  return (
    <div className="flex h-64 items-center justify-center">
      <p>
        Video tidak ditemukan. Kunci API YouTube mungkin hilang, tidak
        valid, atau kuotanya habis.
      </p>
    </div>
  );
}
