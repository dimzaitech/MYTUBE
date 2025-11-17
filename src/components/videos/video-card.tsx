import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FormattedVideo } from '@/services/youtubeService';

export default function VideoCard({ video }: { video: FormattedVideo }) {
  return (
    <Link href="#" className="group block">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={320}
            height={180}
            className="h-full w-full object-cover transition-all duration-200 group-hover:scale-105 group-hover:rounded-none"
            data-ai-hint="video thumbnail"
          />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {video.duration}
          </span>
        </div>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage
              src={video.channelAvatarUrl}
              alt={video.channelName}
              data-ai-hint="person portrait"
            />
            <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground">
              {video.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground hover:text-foreground">
              {video.channelName}
            </p>
            <p className="text-sm text-muted-foreground">
              {video.views} &bull; {video.uploadedAt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
