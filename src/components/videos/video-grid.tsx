
'use client';

import VideoCard from './video-card';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoGridProps {
  videos: FormattedVideo[];
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onVideoClick={onVideoClick} />
      ))}
    </div>
  );
}
