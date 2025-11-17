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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="video thumbnail"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {video.duration}
          </span>
        </div>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={video.channelAvatarUrl} alt={video.channelName} data-ai-hint="person portrait" />
            <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base leading-snug line-clamp-2">
              {video.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {video.channelName}
            </p>
            <p className="text-sm text-muted-foreground">
              {video.views} views &bull; {video.uploadedAt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
