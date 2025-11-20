'use client';

// Type declarations to make JS code compatible with TypeScript
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    YT: any;
  }
  interface Navigator {
    wakeLock: any;
  }
  class MediaMetadata {
    constructor(metadata: any);
    title: string;
    artist: string;
    album: string;
    artwork: { src: string; sizes: string; type: string }[];
  }
}


class BackgroundPlayService {
  player: any | null = null;
  isPlaying: boolean = false;
  mediaSessionSupported: boolean = false;
  wakeLock: any | null = null;
  onEndCallback: (() => void) | null = null;
  autoPlayNext: boolean = true;
  
  constructor() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        this.mediaSessionSupported = 'mediaSession' in navigator;
    }
  }

  setupBackgroundPlay(player: any, videoInfo: any, playlist: any[], currentIndex: number, onEnd: () => void) {
    this.player = player;
    this.onEndCallback = onEnd;

    if (this.mediaSessionSupported) {
      this.setupMediaSession(videoInfo);
      this.setupActionHandlers();
    }
    this.requestWakeLock();
  }

  setupMediaSession(videoInfo: any) {
    if (!this.mediaSessionSupported || !videoInfo) return;

    const metadata = {
        title: videoInfo.title,
        artist: videoInfo.artist,
        album: videoInfo.album,
        artwork: videoInfo.artwork || []
    };
    
    try {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    } catch(e) {
      console.warn("Could not set MediaMetadata. Some background controls may not work.", e);
    }
  }

  setupActionHandlers() {
    if (!this.mediaSessionSupported) return;
    
    const actions: [MediaSessionAction, () => void][] = [
        ['play', () => this.player?.playVideo()],
        ['pause', () => this.player?.pauseVideo()],
        // 'seekbackward' and 'seekforward' are handled by the browser with YT player
        // 'previoustrack' and 'nexttrack' are handled in the component logic via onEnd
    ];

    for (const [action, handler] of actions) {
        try {
            navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
            console.warn(`The media session action "${action}" is not supported.`);
        }
    }
  }

  updateMediaSession(videoInfo: any) {
    this.setupMediaSession(videoInfo);
  }

  setPlayingState(playing: boolean) {
    this.isPlaying = playing;
    if (this.mediaSessionSupported) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
    if (playing) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
  }

  setAutoPlayNext(autoPlay: boolean) {
    this.autoPlayNext = autoPlay;
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
      } catch (err) {
        console.log('Wake Lock failed:', err);
      }
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }
  
  cleanup() {
    this.releaseWakeLock();
    if (this.mediaSessionSupported) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      const actions: MediaSessionAction[] = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'];
      for (const action of actions) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch(e) { /* Ignore */ }
      }
    }
    this.player = null;
    this.onEndCallback = null;
  }
}

const backgroundPlayService = new BackgroundPlayService();
export default backgroundPlayService;
