
'use client';

import Image from 'next/image';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoCardProps {
  video: FormattedVideo;
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoCard({ video, onVideoClick }: VideoCardProps) {
  
  return (
    <div
      className="video-item"
      onClick={() => onVideoClick(video)}
    >
        <div className="thumbnail">
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
        <div className="video-info">
            <img 
                src={video.channelAvatarUrl} 
                alt={video.channelName} 
                className="channel-icon"
            />
            <div className="video-details">
                <h3>{video.title}</h3>
                <p>{video.channelName}</p>
                <p>{video.views} • {video.uploadedAt}</p>
            </div>
        </div>
    </div>
  );
}
