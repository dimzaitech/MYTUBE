
'use client';

import VideoCard from './video-card';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoGridProps {
  videos: FormattedVideo[];
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  return (
    <>
      {videos.map((video, index) => (
        <VideoCard key={video.id + '-' + index} video={video} onVideoClick={onVideoClick} />
      ))}
    </>
  );
}
