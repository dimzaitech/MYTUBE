
'use client';

import Image from 'next/image';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoCardProps {
  video: FormattedVideo;
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoCard({ video, onVideoClick }: VideoCardProps) {
  
  const handleCastClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onVideoClick
    if (window && (window as any).openCastModal) {
      (window as any).openCastModal(video.title);
    }
  };

  return (
    <div
      className="mobile-video-item"
      onClick={() => onVideoClick(video)}
    >
        <div className="mobile-thumbnail">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={400}
              height={225}
              layout="responsive"
              objectFit="cover"
            />
            <div className="duration">{video.duration}</div>
        </div>
        <div className="mobile-video-info">
            <img 
                src={video.channelAvatarUrl} 
                alt={video.channelName} 
                className="mobile-channel-avatar"
            />
            <div className="mobile-video-details">
                <h3 className="mobile-video-title">{video.title}</h3>
                <p className="mobile-video-meta">{video.channelName}</p>
                <p className="mobile-video-meta">{video.views} • {video.uploadedAt}</p>
            </div>
        </div>
    </div>
  );
}
