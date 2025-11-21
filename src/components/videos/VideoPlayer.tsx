
'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import backgroundPlayService from '@/lib/backgroundPlayService';
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);

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
    <div style={{ width: '100%', paddingTop: '16px' }}>
      <div style={{aspectRatio: '16/9', width: '100%', overflow: 'hidden', borderRadius: '12px', background: '#000'}}>
        <div id="youtube-player" style={{ height: '100%', width: '100%' }}>
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

      <div className="video-player-details">
        <h1 style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.3', color: '#fff' }}>
          {video.title}
        </h1>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#aaa' }}>
          <span>{video.views}</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <span>{video.uploadedAt}</span>
        </p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', borderTop: '1px solid #303030', borderBottom: '1px solid #303030', marginBottom: '16px' }}>
        <img
            src={video.channelAvatarUrl}
            alt={video.channelName}
            style={{ height: '48px', width: '48px', borderRadius: '50%' }}
          />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', color: '#fff' }}>
            {video.channelName}
          </p>
        </div>
        <button 
          onClick={() => setIsSubscribed(!isSubscribed)}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            borderRadius: '20px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            background: isSubscribed ? '#303030' : '#fff',
            color: isSubscribed ? '#aaa' : '#0f0f0f',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isSubscribed ? '✓ Disubscribe' : 'Subscribe'}
        </button>
      </div>

      <div className="video-description-box">
        <p style={{ fontSize: '14px', fontWeight: '500' }}>{video.views} &bull; {video.uploadedAt}</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Deskripsi video akan ditampilkan di sini. Konten ini adalah placeholder karena data deskripsi tidak diambil dari API untuk saat ini.
        </p>
      </div>

    </div>
  );
}
