
'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import backgroundPlayService from '@/lib/backgroundPlayService';
import { type FormattedVideo } from '@/services/youtubeService';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, Download, ListPlus } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import RecommendationSidebar from '../queue/RecommendationSidebar';


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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const { addToQueue } = useQueue();

  useEffect(() => {
    if (video) {
      backgroundPlayService.setupBackgroundPlay(
        playerRef.current, 
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
    playerRef.current = event.target;
    if (event.data === window.YT.PlayerState.PLAYING) {
      backgroundPlayService.setPlayingState(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      backgroundPlayService.setPlayingState(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      onEnd();
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
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

        <div className="mt-4">
          <h1 className="text-xl font-bold text-foreground">{video.title}</h1>
          
          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center">
             <div className="flex items-center gap-3">
              <Image
                src={video.channelAvatarUrl}
                alt={video.channelName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-foreground">{video.channelName}</p>
                <p className="text-xs text-muted-foreground">1.2jt subscriber</p>
              </div>
            </div>
             <Button 
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`rounded-full font-semibold ${isSubscribed ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-foreground text-background hover:bg-foreground/90'}`}
             >
              {isSubscribed ? 'Disubscribe' : 'Subscribe'}
            </Button>
            
            <div className="flex items-center gap-2 md:ml-auto">
              <Button variant="secondary" className="rounded-full">
                <ThumbsUp className="mr-2 h-5 w-5" /> 10K
              </Button>
              <Button variant="secondary" className="rounded-full">
                <ThumbsDown className="h-5 w-5" />
              </Button>
              <Button variant="secondary" className="rounded-full">
                <Share2 className="mr-2 h-5 w-5" /> Bagikan
              </Button>
              <Button variant="secondary" className="rounded-full" onClick={() => addToQueue(video)}>
                <ListPlus className="mr-2 h-5 w-5" /> Tambahkan
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
           <p className="mb-1 font-semibold">{video.views} &bull; {video.uploadedAt}</p>
           <p>
            Ini adalah deskripsi video placeholder. Di aplikasi nyata, deskripsi video akan dimuat dari API YouTube untuk memberikan konteks lebih lanjut tentang konten yang sedang diputar.
           </p>
        </div>
      </div>
      
      <div className="w-full lg:w-[400px] lg:min-w-[400px]">
        <RecommendationSidebar />
      </div>
    </div>
  );
}

