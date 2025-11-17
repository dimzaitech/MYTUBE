'use client';

import VideoCard from './video-card';
import type { FormattedVideo } from '@/services/youtubeService';

export default function VideoGrid({ videos }: { videos: FormattedVideo[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
