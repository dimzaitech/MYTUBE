
'use client';

import VideoCard from './video-card';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoGridProps {
  videos: FormattedVideo[];
  onVideoClick: (video: FormattedVideo) => void;
  isDesktop: boolean;
}

export default function VideoGrid({ videos, onVideoClick, isDesktop }: VideoGridProps) {
  return (
    <>
      {videos.map((video, index) => (
        <VideoCard key={video.id + '-' + index} video={video} onVideoClick={onVideoClick} isDesktop={isDesktop} />
      ))}
    </>
  );
}
