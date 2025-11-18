import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FormattedVideo } from '@/services/youtubeService';
import { Button } from '@/components/ui/button';
import { Plus, Play } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { useToast } from '@/hooks/use-toast';

interface VideoCardProps {
  video: FormattedVideo;
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoCard({ video, onVideoClick }: VideoCardProps) {
  const { addToQueue } = useQueue();
  const { toast } = useToast();

  const handleAddToQueue = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    addToQueue(video);
    toast({
      title: 'Ditambahkan ke Antrean',
      description: `${video.title}`,
    });
  };

  const handlePlayClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    onVideoClick(video);
  };

  return (
    <div
      className="group block cursor-pointer"
      onClick={() => onVideoClick(video)}
    >
      <div className="flex flex-col gap-2 md:gap-3">
        <div className="relative w-full overflow-hidden rounded-lg md:rounded-xl">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={320}
            height={180}
            className="aspect-video w-full object-cover transition-all duration-300 group-hover:scale-110"
            data-ai-hint="video thumbnail"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary"
              aria-label="Play"
              onClick={handlePlayClick}
            >
              <Play className="h-5 w-5 fill-current" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
              aria-label="Tambah ke antrean"
              onClick={handleAddToQueue}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
            {video.duration}
          </span>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0 md:h-9 md:w-9">
            <AvatarImage
              src={video.channelAvatarUrl}
              alt={video.channelName}
              data-ai-hint="person portrait"
            />
            <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground md:text-base">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground hover:text-foreground md:text-sm">
              {video.channelName}
            </p>
            <p className="text-xs text-muted-foreground md:text-sm">
              {video.views} &bull; {video.uploadedAt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
