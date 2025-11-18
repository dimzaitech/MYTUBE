'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { FormattedVideo } from '@/services/youtubeService';

interface VideoPlayerProps {
  video: FormattedVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayer({
  video,
  isOpen,
  onClose,
}: VideoPlayerProps) {
  if (!video) {
    return null;
  }

  const videoSrc = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 !gap-0 border-0">
        <div className="aspect-video w-full">
          <iframe
            src={videoSrc}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          ></iframe>
        </div>
        <div className="p-4">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl mb-3">
              {video.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={video.channelAvatarUrl}
                  alt={video.channelName}
                  data-ai-hint="person portrait"
                />
                <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {video.channelName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {video.views} &bull; {video.uploadedAt}
                </p>
              </div>
            </div>
            <Button className="w-full sm:w-auto" size="sm">
              Subscribe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
