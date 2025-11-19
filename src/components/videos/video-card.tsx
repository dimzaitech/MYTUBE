import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    // Optional: Add toast notification
  };

  return (
    <div
      className="group block cursor-pointer bg-card"
      onClick={() => onVideoClick(video)}
    >
      <div className="flex flex-col">
        <div className="relative w-full">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={320}
            height={180}
            className="aspect-video w-full object-cover"
            data-ai-hint="video thumbnail"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        </div>
        <div className="flex gap-3 p-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage
              src={video.channelAvatarUrl}
              alt={video.channelName}
              data-ai-hint="person portrait"
            />
            <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="line-clamp-2 text-base font-medium leading-tight text-foreground">
              {video.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <span>{video.channelName}</span>
            </p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{video.views}</span>
              <span>&bull;</span>
              <span>{video.uploadedAt}</span>
            </div>
          </div>
          <button
            onClick={handleAddToQueue}
            className="self-start p-1 text-muted-foreground"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
