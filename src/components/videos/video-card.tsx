'use client';

import Image from 'next/image';
import type { FormattedVideo } from '@/services/youtubeService';
import { useQueue } from '@/context/QueueContext';
import { MoreVertical, Play, Cast, ListPlus } from 'lucide-react';

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
  
  const handleSimpleCast = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`vnd.youtube:${video.id}`);
    } else {
      window.open(
        `https://www.youtube.com/watch?v=${video.id}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <div
      className="group video-card"
      onClick={() => onVideoClick(video)}
    >
      <div className="thumbnail-container">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={320}
          height={180}
          className="w-full h-auto"
          data-ai-hint="video thumbnail"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className='w-12 h-12 rounded-full bg-black/50 flex items-center justify-center'>
                <Play className="h-8 w-8 text-white" fill="white" />
            </div>
        </div>
        <div className="absolute top-2 right-2 flex-col items-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 hidden sm:flex">
            <button
              onClick={handleAddToQueue}
              className="h-auto gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-red-600/80"
              title="Add to Queue"
            >
              <ListPlus className="h-3 w-3" />
              <span>Antrekan</span>
            </button>
            <button
              onClick={handleSimpleCast}
              className="h-auto gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-red-600/80"
              title="Open in YouTube to Cast"
            >
              <Cast className="h-3 w-3" />
              <span>Cast</span>
            </button>
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>
      </div>
      <div className="video-info flex gap-3">
         <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            className="h-9 w-9 rounded-full flex-shrink-0 mt-1"
          />
        <div className="flex-1 overflow-hidden">
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
        <div className="flex self-start">
            <button
              onClick={handleAddToQueue}
              className="p-1 text-gray-400 hover:text-white h-8 w-8"
              title="More actions"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
      </div>
    </div>
  );
}
