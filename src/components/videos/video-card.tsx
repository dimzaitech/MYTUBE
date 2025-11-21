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
      style={{ cursor: 'pointer' }}
    >
      <div className="thumbnail-container">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={320}
          height={180}
          layout="responsive"
          data-ai-hint="video thumbnail"
        />
        <span style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {video.duration}
        </span>
      </div>
      <div className="video-info" style={{ display: 'flex', gap: '12px' }}>
         <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              flexShrink: 0,
              marginTop: '4px'
            }}
          />
        <div style={{ flex: '1', overflow: 'hidden' }}>
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
              title="More actions"
            >
              <MoreVertical style={{ height: '20px', width: '20px' }} />
            </button>
          </div>
      </div>
    </div>
  );
}
