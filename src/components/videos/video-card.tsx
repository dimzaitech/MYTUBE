import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoCardProps {
  video: FormattedVideo;
  onVideoClick: (video: FormattedVideo) => void;
}

export default function VideoCard({ video, onVideoClick }: VideoCardProps) {
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
            className="aspect-video w-full object-cover transition-all duration-200 group-hover:rounded-none"
            data-ai-hint="video thumbnail"
          />
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
