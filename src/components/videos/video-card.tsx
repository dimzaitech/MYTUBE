'use client';

import Image from 'next/image';
import type { FormattedVideo } from '@/services/youtubeService';
import { useQueue } from '@/context/QueueContext';
import { MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: FormattedVideo;
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoCard({ video, onVideoClick }: VideoCardProps) {
  const { addToQueue } = useQueue();

  const handleAddToQueue = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    addToQueue(video);
  };
  
  return (
    <div
      className="video-card"
      onClick={() => onVideoClick(video)}
    >
      <div className="thumbnail-container">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={360}
          height={202}
          layout="responsive"
          objectFit="cover"
          data-ai-hint="video thumbnail"
        />
        <div className="duration">
          {video.duration}
        </div>
      </div>
      <div className="video-info">
        <div className="channel-avatar" style={{backgroundImage: `url(${video.channelAvatarUrl})`, backgroundSize: 'cover'}}></div>
        <div className="video-details">
          <h3 className="video-title">
            {video.title}
          </h3>
          <p className="video-channel">
            {video.channelName}
          </p>
          <div className="video-metadata">
            <span>{video.views}</span>
            <div className="dot"></div>
            <span>{video.uploadedAt}</span>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start' }}>
            <button
              onClick={handleAddToQueue}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Tambahkan ke antrean"
            >
              <MoreVertical style={{ height: '20px', width: '20px' }} />
            </button>
        </div>
      </div>
    </div>
  );
}
