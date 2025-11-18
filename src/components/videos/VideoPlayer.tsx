'use client';

import { useEffect } from 'react';
import YouTube from 'react-youtube';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type FormattedVideo } from '@/services/youtubeService';
import backgroundPlayService from '@/lib/backgroundPlayService';

interface VideoPlayerProps {
  video: FormattedVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onEnd: () => void;
}

export default function VideoPlayer({
  video,
  isOpen,
  onClose,
  onEnd,
}: VideoPlayerProps) {
  useEffect(() => {
    // NOTE: The following code attempts to set up background play.
    // However, due to YouTube's iframe restrictions, we cannot access the
    // underlying <video> element. Therefore, backgroundPlayService will not
    // function as intended. This code is kept for logical structure based on user request.
    if (isOpen && video) {
      console.warn(
        'Attempting to set up background play. This will not work with the YouTube iframe.'
      );
      // We pass `null` for the video element because we cannot access it.
      // The service is designed to handle this gracefully but will not be functional.
      backgroundPlayService.setupBackgroundPlay(
        null,
        {
          title: video.title,
          channel: video.channelName,
          thumbnail: video.thumbnailUrl,
        },
        [], // videoList is not available here
        0, // currentIndex is not available here
        onEnd // Use onEnd as the callback
      );
      backgroundPlayService.setAutoPlayNext(true);
    }

    // Cleanup when the dialog is closed
    return () => {
      if (!isOpen) {
        backgroundPlayService.cleanup();
      }
    };
  }, [isOpen, video, onEnd]);

  useEffect(() => {
    // Update media session info if video changes while player is open
    if (video && isOpen) {
      backgroundPlayService.updateVideoInfo(
        {
          title: video.title,
          channel: video.channelName,
          thumbnail: video.thumbnailUrl,
        },
        0 // currentIndex is not available here
      );
    }
  }, [video, isOpen]);

  const handleClosePlayer = () => {
    backgroundPlayService.cleanup();
    onClose();
  };

  if (!video) {
    return null;
  }

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClosePlayer}>
      <DialogContent className="max-w-4xl w-full p-0 !gap-0 border-0">
        <div className="aspect-video w-full bg-black">
          <YouTube
            videoId={video.id}
            opts={opts}
            className="w-full h-full"
            onReady={(event) => {
              // The 'event.target' is the YouTube player object.
              // We still cannot get the raw <video> element from it.
            }}
            onPlay={() => backgroundPlayService.setPlayingState(true)}
            onPause={() => backgroundPlayService.setPlayingState(false)}
            onEnd={onEnd}
          />
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
