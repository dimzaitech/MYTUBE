import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FormattedVideo } from '@/services/youtubeService';
import { useQueue } from '@/context/QueueContext';
import { MoreVertical, Play, Cast, ListPlus } from 'lucide-react';
import { Button } from '../ui/button';

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
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className='w-12 h-12 rounded-full bg-black/50 flex items-center justify-center'>
                <Play className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
           <div className="absolute top-2 right-2 flex flex-col items-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              onClick={handleAddToQueue}
              className="h-auto gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-primary/80"
              title="Add to Queue"
            >
              <ListPlus className="h-3 w-3" />
              <span>Antrekan</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSimpleCast}
              className="h-auto gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-primary/80"
              title="Open in YouTube to Cast"
            >
              <Cast className="h-3 w-3" />
              <span>Cast</span>
            </Button>
          </div>
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
          <div className="flex self-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddToQueue}
              className="p-1 text-muted-foreground hover:text-foreground h-8 w-8"
              title="More actions"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
