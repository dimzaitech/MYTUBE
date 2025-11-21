
'use client';

import VideoCard from './video-card';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoListProps {
  videos: FormattedVideo[];
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoList({ videos, onVideoClick }: VideoListProps) {
  return (
    <>
      {videos.map((video, index) => (
        <div key={video.id}>
            <VideoCard video={video} onVideoClick={onVideoClick} />
            {index < videos.length - 1 && <div className="divider"></div>}
        </div>
      ))}
    </>
  );
}

