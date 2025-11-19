'use client';

import { useEffect, useState } from 'react';
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
import castService from '@/services/castService';
import { Cast } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for cast availability periodically
    const interval = setInterval(() => {
      const available =
        castService.getCastState() !== 'NO_DEVICES_AVAILABLE';
      if (available !== isCastAvailable) {
        setIsCastAvailable(available);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCastAvailable]);

  useEffect(() => {
    if (isOpen && video) {
      console.warn(
        'Attempting to set up background play. This will not work with the YouTube iframe.'
      );
      backgroundPlayService.setupBackgroundPlay(
        null, // videoRef.current is not available with react-youtube
        {
          title: video.title,
          channel: video.channelName,
          thumbnail: video.thumbnailUrl,
        },
        [],
        0,
        onEnd
      );
      backgroundPlayService.setAutoPlayNext(true);
    }

    return () => {
      if (!isOpen) {
        backgroundPlayService.cleanup();
      }
    };
  }, [isOpen, video, onEnd]);

  useEffect(() => {
    if (video && isOpen) {
      backgroundPlayService.updateVideoInfo(
        {
          title: video.title,
          channel: video.channelName,
          thumbnail: video.thumbnailUrl,
        },
        0
      );
    }
  }, [video, isOpen]);

  const handleCastVideo = async () => {
    if (!video) return;

    // A real implementation would need a way to get the direct video stream URL,
    // which the YouTube API doesn't provide for free.
    // We'll simulate this with a placeholder.
    toast({
      title: 'Fitur Casting Dalam Pengembangan',
      description: 'Casting video dari YouTube secara langsung memerlukan akses API yang berbeda.',
    });

    // Example of how it would work with a direct URL:
    /*
    const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const success = await castService.castVideo({
      videoUrl,
      title: video.title,
      channel: video.channelName,
      thumbnail: video.thumbnailUrl,
      currentTime: 0, // Ideally, get current time from the player
    });

    if (success) {
      toast({ title: 'Casting to TV...' });
      onClose(); // Close the local player
    } else {
      toast({ variant: 'destructive', title: 'Casting Failed', description: 'Could not connect to the device.' });
    }
    */
  };

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
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full p-0 !gap-0 border-0">
        <div className="aspect-video w-full bg-black">
          <YouTube
            videoId={video.id}
            opts={opts}
            className="w-full h-full"
            onReady={(event) => {
              // The 'event.target' is the YouTube player object.
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
            <div className="flex items-center gap-2">
               {isCastAvailable && (
                <Button variant="outline" size="sm" onClick={handleCastVideo} className='gap-2'>
                  <Cast className="h-4 w-4" /> Cast to TV
                </Button>
              )}
              <Button className="w-full sm:w-auto" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
