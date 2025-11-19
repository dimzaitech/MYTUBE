'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
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
  const playerRef = useRef<YouTubePlayer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      const available = castService.getCastState() !== 'NO_DEVICES_AVAILABLE';
      if (available !== isCastAvailable) {
        setIsCastAvailable(available);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCastAvailable]);
  
  useEffect(() => {
    if (isOpen && video) {
      backgroundPlayService.setupBackgroundPlay(
        null, 
        {
          title: video.title,
          artist: video.channelName,
          album: 'MyTUBE',
          artwork: [
            { src: video.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }
          ],
        },
        [],
        0,
        onEnd
      );
      backgroundPlayService.setAutoPlayNext(true);
    } else {
        backgroundPlayService.cleanup();
    }
    
    return () => {
        if (!isOpen) {
            backgroundPlayService.cleanup();
        }
    };
  }, [isOpen, video, onEnd]);


  useEffect(() => {
    if (video && isOpen && playerRef.current) {
      backgroundPlayService.updateMediaSession({
        title: video.title,
        artist: video.channelName,
        album: 'MyTUBE',
        artwork: [{ src: video.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }]
      });
    }
  }, [video, isOpen]);


  const handleCastVideo = async () => {
    if (!video) return;

    toast({
      title: 'Fitur Casting Dalam Pengembangan',
      description:
        'Mencoba fallback dengan membuka di YouTube...',
    });

    // Fallback: Open in YouTube app on mobile, or new tab on desktop
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
      modestbranding: 1,
      showinfo: 0,
      playsinline: 1,
    },
  };
  
  const onPlayerStateChange = (event: { data: number }) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      backgroundPlayService.setPlayingState(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      backgroundPlayService.setPlayingState(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      onEnd();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClosePlayer}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full p-0 !gap-0 bg-card">
        <div className="aspect-video w-full bg-black">
          <YouTube
            videoId={video.id}
            opts={opts}
            className="w-full h-full"
            onReady={(event) => {
              playerRef.current = event.target;
            }}
            onStateChange={onPlayerStateChange}
            onError={(e) => console.error('YouTube Player Error:', e)}
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
                <Button
                  onClick={handleCastVideo}
                  className="gap-2 h-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 bg-black/50 text-white hover:bg-primary/80 hover:border-primary"
                >
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
