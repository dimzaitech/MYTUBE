'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type FormattedVideo } from '@/services/youtubeService';
import backgroundPlayService from '@/lib/backgroundPlayService';
import castService from '@/services/castService';
import { Cast, ThumbsUp, ThumbsDown, Share, ListPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  video: FormattedVideo | null;
  onClose: () => void;
  onEnd: () => void;
}

export default function VideoPlayer({
  video,
  onClose,
  onEnd,
}: VideoPlayerProps) {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
    if (video) {
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
      backgroundPlayService.cleanup();
    };
  }, [video, onEnd]);


  useEffect(() => {
    if (video && playerRef.current) {
      backgroundPlayService.updateMediaSession({
        title: video.title,
        artist: video.channelName,
        album: 'MyTUBE',
        artwork: [{ src: video.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }]
      });
    }
  }, [video]);


  const handleCastVideo = async () => {
    if (!video) return;

    toast({
      title: 'Fitur Casting Dalam Pengembangan',
      description:
        'Mencoba fallback dengan membuka di YouTube...',
    });

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
      controls: 1,
    },
  };
  
  const onPlayerStateChange = (event: { data: number; target: YouTubePlayer }) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      backgroundPlayService.setPlayingState(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      backgroundPlayService.setPlayingState(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      onEnd();
    }
  };


  return (
    <div className="w-full video-info-section">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black video-container">
        <div id="youtube-player" className="youtube-player h-full w-full">
          <YouTube
            videoId={video.id}
            opts={opts}
            className="h-full w-full"
            onReady={(event) => {
              playerRef.current = event.target;
            }}
            onStateChange={onPlayerStateChange}
            onError={(e) => console.error('YouTube Player Error:', e)}
          />
        </div>
      </div>

      <div className="py-4">
        <h1 className="text-lg font-semibold leading-snug text-foreground line-clamp-2 video-title-main">
          {video.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground video-stats">
          <span>{video.views}</span>
          <span className="mx-2 dot">•</span>
          <span>{video.uploadedAt}</span>
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-4 border-b border-border action-buttons">
           <div className="flex items-center rounded-full bg-secondary">
              <Button variant="ghost" size="sm" className="action-btn like-btn rounded-full gap-2 pl-4 pr-3">
                  <ThumbsUp className="h-5 w-5" /> 123rb
              </Button>
              <div className="w-px h-6 bg-border"></div>
              <Button variant="ghost" size="sm" className="action-btn dislike-btn rounded-full px-3">
                  <ThumbsDown className="h-5 w-5" />
              </Button>
          </div>
           <Button variant="secondary" size="sm" className="action-btn share-btn rounded-full gap-2">
              <Share className="h-4 w-4" /> Bagikan
          </Button>
          <Button variant="secondary" size="sm" className="action-btn save-btn rounded-full gap-2">
              <ListPlus className="h-4 w-4" /> Simpan
          </Button>
           {isCastAvailable && (
              <Button variant="secondary" size="sm" onClick={handleCastVideo} className="gap-2 rounded-full">
                  <Cast className="h-4 w-4" /> Cast
              </Button>
           )}
      </div>

      <div className="flex items-center gap-3 py-4 border-b border-border mb-4 channel-info">
        <Avatar className='channel-avatar h-12 w-12'>
          <AvatarImage
            src={video.channelAvatarUrl}
            alt={video.channelName}
            data-ai-hint="person portrait"
          />
          <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 channel-details">
          <p className="font-semibold text-foreground channel-name">
            {video.channelName}
          </p>
          <p className="text-xs text-muted-foreground subscriber-count">
            10 jt subscriber
          </p>
        </div>
        <Button 
          onClick={() => setIsSubscribed(!isSubscribed)}
          className={`w-full sm:w-auto px-4 py-2 text-sm rounded-full font-semibold transition-colors subscribe-btn ${isSubscribed ? 'subscribed bg-secondary text-muted-foreground hover:bg-accent' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        >
          {isSubscribed ? '✓ Disubscribe' : 'Subscribe'}
        </Button>
      </div>

      <div className="p-4 rounded-xl bg-secondary description-section">
        <p className='text-sm font-medium text-foreground'>{video.views} &bull; {video.uploadedAt}</p>
        <p className="text-sm text-foreground/80 mt-2 description-text">
            Deskripsi video akan ditampilkan di sini. Konten ini adalah placeholder karena data deskripsi tidak diambil dari API untuk saat ini.
        </p>
      </div>

    </div>
  );
}
