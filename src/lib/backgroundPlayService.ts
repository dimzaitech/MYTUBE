'use client';

// Type declarations to make JS code compatible with TypeScript
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
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
  audioContext: AudioContext | null = null;
  videoElement: HTMLVideoElement | null = null;
  mediaSource: any = null; // Adjust type as needed
  isPlaying: boolean = false;
  isBackgroundSupported: boolean = false;
  currentVideoIndex: number = 0;
  videoList: any[] = [];
  onNextVideo: ((index: number) => void) | null = null;
  autoPlayNext: boolean = true;
  wakeLock: any | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        this.checkBackgroundSupport();
        this.setupEventListeners();
    }
  }

  checkBackgroundSupport() {
    this.isBackgroundSupported =
      'serviceWorker' in navigator &&
      'mediaSession' in navigator &&
      'wakeLock' in navigator;

    console.log('Background play supported:', this.isBackgroundSupported);
    return this.isBackgroundSupported;
  }

  setupEventListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        this.enterBackgroundMode();
      } else {
        this.exitBackgroundMode();
      }
    });

    window.addEventListener('pagehide', () => {
      if (this.isPlaying) {
        this.enterBackgroundMode();
      }
    });

    window.addEventListener('pageshow', () => {
      this.exitBackgroundMode();
    });

    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  async setupBackgroundPlay(videoElement: HTMLVideoElement | null, videoInfo: any, videoList: any[] = [], currentIndex: number = 0, onNextCallback: ((index: number) => void) | null = null) {
    if (!this.isBackgroundSupported || !videoElement) {
        console.warn('Background play is not supported or video element is missing.');
        return;
    }

    this.videoElement = videoElement;
    this.videoList = videoList;
    this.currentVideoIndex = currentIndex;
    this.onNextVideo = onNextCallback;

    this.setupMediaSession(videoInfo);
    
    this.setupServiceWorker();
    
    await this.requestWakeLock();
    
    this.setupVideoListeners();
  }

  setupMediaSession(videoInfo: any) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: videoInfo.title,
      artist: videoInfo.channel,
      album: 'MyTUBE',
      artwork: [
        { src: videoInfo.thumbnail, sizes: '96x96', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '128x128', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '192x192', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '256x256', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '384x384', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      this.videoElement?.play();
      this.isPlaying = true;
      this.updatePlaybackState('playing');
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.videoElement?.pause();
      this.isPlaying = false;
      this.updatePlaybackState('paused');
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details: any) => {
      if (!this.videoElement) return;
      const skipTime = details.seekOffset || 10;
      this.videoElement.currentTime = Math.max(this.videoElement.currentTime - skipTime, 0);
    });

    navigator.mediaSession.setActionHandler('seekforward', (details: any) => {
      if (!this.videoElement) return;
      const skipTime = details.seekOffset || 10;
      this.videoElement.currentTime = Math.min(
        this.videoElement.currentTime + skipTime,
        this.videoElement.duration
      );
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      this.playPreviousVideo();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.playNextVideo();
    });

    this.updatePlaybackState('playing');
  }

  setupVideoListeners() {
    if (!this.videoElement) return;

    this.videoElement.addEventListener('ended', () => {
      this.handleVideoEnd();
    });

    this.videoElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlaybackState('playing');
      this.requestWakeLock();
    });

    this.videoElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlaybackState('paused');
      this.releaseWakeLock();
    });
  }

  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');

        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
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

  enterBackgroundMode() {
    if (!this.videoElement) return;

    console.log('Entering background mode');

    if (this.isIOS()) {
      this.setupAudioContext();
    }

    if (!this.isPlaying) {
      this.videoElement.play().catch(console.error);
    }
  }

  exitBackgroundMode() {
    console.log('Exiting background mode');

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  setupAudioContext() {
    if (!this.videoElement) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaElementSource(this.videoElement);
      source.connect(this.audioContext.destination);

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0;
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();

    } catch (error) {
      console.error('Error setting up audio context:', error);
    }
  }

  handleVideoEnd() {
    this.isPlaying = false;
    this.updatePlaybackState('none');

    if (this.autoPlayNext && this.videoList && this.onNextVideo) {
      const nextIndex = this.currentVideoIndex + 1;
      if (nextIndex < this.videoList.length) {
        setTimeout(() => {
          this.playNextVideo();
        }, 1000);
      }
    }
  }

  playNextVideo() {
    if (this.onNextVideo && this.videoList) {
        const nextIndex = (this.currentVideoIndex + 1) % this.videoList.length;
        this.onNextVideo(nextIndex);
    }
  }

  playPreviousVideo() {
    if (this.onNextVideo && this.videoList) {
        const prevIndex = (this.currentVideoIndex - 1 + this.videoList.length) % this.videoList.length;
        this.onNextVideo(prevIndex);
    }
  }
  
  updateMediaSession(videoInfo: any) {
    if (!('mediaSession' in navigator) || !videoInfo) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: videoInfo.title,
      artist: videoInfo.channel,
      album: 'MyTUBE',
      artwork: [
        { src: videoInfo.thumbnail, sizes: '96x96', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '128x128', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '192x192', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '256x256', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '384x384', type: 'image/jpeg' },
        { src: videoInfo.thumbnail, sizes: '512x512', type: 'image/jpeg' }
      ]
    });
  }

  updatePlaybackState(state: "none" | "paused" | "playing") {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = state;
  }

  setPlayingState(playing: boolean) {
    this.isPlaying = playing;
    this.updatePlaybackState(playing ? 'playing' : 'paused');

    if (playing) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
  }

  setAutoPlayNext(autoPlay: boolean) {
    this.autoPlayNext = autoPlay;
  }

  updateVideoInfo(videoInfo: any, index: number) {
    this.currentVideoIndex = index;
    if ('mediaSession' in navigator && videoInfo) {
      this.updateMediaSession(videoInfo);
    }
  }

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.wakeLock) {
      this.releaseWakeLock();
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }

    this.videoElement = null;
    this.isPlaying = false;
    this.videoList = [];
    this.onNextVideo = null;
  }
}

const backgroundPlayService = new BackgroundPlayService();
export default backgroundPlayService;
