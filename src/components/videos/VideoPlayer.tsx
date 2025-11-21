'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import backgroundPlayService from '@/lib/backgroundPlayService';
import castService from '@/services/castService';
import { Cast, ThumbsUp, ThumbsDown, Share, ListPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type FormattedVideo } from '@/services/youtubeService';

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
    <div className="w-full">
      <div style={{aspectRatio: '16/9'}} className="w-full overflow-hidden rounded-xl bg-black">
        <div id="youtube-player" className="h-full w-full">
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
        <h1 className="text-lg font-semibold leading-snug text-white line-clamp-2">
          {video.title}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          <span>{video.views}</span>
          <span className="mx-2">·</span>
          <span>{video.uploadedAt}</span>
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-gray-700">
           <div className="flex items-center rounded-full bg-gray-800">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-700">
                  <ThumbsUp className="h-5 w-5" /> 123rb
              </button>
              <div className="w-px h-6 bg-gray-700"></div>
              <button className="px-3 py-2 rounded-full hover:bg-gray-700">
                  <ThumbsDown className="h-5 w-5" />
              </button>
          </div>
           <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <Share className="h-4 w-4" /> Bagikan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <ListPlus className="h-4 w-4" /> Simpan
          </button>
           {isCastAvailable && (
              <button onClick={handleCastVideo} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700">
                  <Cast className="h-4 w-4" /> Cast
              </button>
           )}
      </div>

      <div className="flex items-center gap-3 py-4 border-b border-gray-700 mb-4">
        <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            className="h-12 w-12 rounded-full"
          />
        <div className="flex-1">
          <p className="font-semibold text-white">
            {video.channelName}
          </p>
          <p className="text-xs text-gray-400">
            10 jt subscriber
          </p>
        </div>
        <button 
          onClick={() => setIsSubscribed(!isSubscribed)}
          className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors ${isSubscribed ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-black hover:bg-gray-200'}`}
        >
          {isSubscribed ? '✓ Disubscribe' : 'Subscribe'}
        </button>
      </div>

      <div className="p-4 rounded-xl bg-gray-800">
        <p className='text-sm font-medium text-white'>{video.views} &bull; {video.uploadedAt}</p>
        <p className="text-sm text-gray-300 mt-2">
            Deskripsi video akan ditampilkan di sini. Konten ini adalah placeholder karena data deskripsi tidak diambil dari API untuk saat ini.
        </p>
      </div>

    </div>
  );
}
