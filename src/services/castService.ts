'use client';

// Type definitions for the Chromecast Sender API
// These are necessary because the types are not available via @types/chrome
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: any;
    chrome?: any;
  }
}

type VideoInfo = {
  videoUrl: string;
  title: string;
  channel: string;
  thumbnail: string;
  currentTime?: number;
};

class CastService {
  public castContext: any | null = null;
  public currentSession: any | null = null;
  public isAvailable: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeCast();
    }
  }

  initializeCast() {
    if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
      this.isAvailable = true;
      this.initializeCastApi();
    } else {
      this.loadCastSDK();
    }
  }

  loadCastSDK() {
    if (
      typeof window === 'undefined' ||
      window.document.getElementById('cast-sdk')
    ) {
      return;
    }

    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        this.initializeCastApi();
      }
    };

    const script = document.createElement('script');
    script.id = 'cast-sdk';
    script.src =
      'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    document.head.appendChild(script);
  }

  initializeCastApi() {
    try {
      const castContext = window.cast.framework.CastContext.getInstance();
      castContext.setOptions({
        receiverApplicationId:
          window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      this.castContext = castContext;
      this.isAvailable = true;

      castContext.addEventListener(
        window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        (event: any) => {
          this.onCastStateChanged(event);
        }
      );

      castContext.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event: any) => {
          this.onSessionStateChanged(event);
        }
      );

      console.log('Chromecast initialized successfully');
    } catch (error) {
      console.error('Error initializing Chromecast:', error);
      this.isAvailable = false;
    }
  }

  onCastStateChanged(event: any) {
    console.log('Cast state changed:', event.castState);
  }

  onSessionStateChanged(event: any) {
    console.log('Session state changed:', event.sessionState);
    this.currentSession = this.castContext.getCurrentSession();
  }

  async requestSession() {
    if (!this.isAvailable || !this.castContext) {
      console.error('Chromecast not available');
      return false;
    }

    try {
      await this.castContext.requestSession();
      return true;
    } catch (error) {
      console.error('Error requesting cast session:', error);
      return false;
    }
  }

  async castVideo(videoInfo: VideoInfo) {
    if (!this.currentSession) {
      const success = await this.requestSession();
      if (!success) return false;
    }

    try {
      const mediaInfo = new window.chrome.cast.media.MediaInfo(
        videoInfo.videoUrl,
        'video/mp4'
      );
      mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = videoInfo.title;
      mediaInfo.metadata.subtitle = videoInfo.channel;
      mediaInfo.metadata.images = [
        new window.chrome.cast.Image(videoInfo.thumbnail),
      ];

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = videoInfo.currentTime || 0;

      await this.currentSession.loadMedia(request);
      console.log('Video cast successfully');
      return true;
    } catch (error) {
      console.error('Error casting video:', error);
      return false;
    }
  }

  async stopCasting() {
    if (this.currentSession) {
      try {
        await this.currentSession.endSession(true);
        this.currentSession = null;
        return true;
      } catch (error) {
        console.error('Error stopping cast:', error);
        return false;
      }
    }
    return false;
  }

  getCastState() {
    if (!this.castContext) return 'NO_DEVICES_AVAILABLE';
    return this.castContext.getCastState();
  }

  isCasting() {
    return this.currentSession !== null;
  }
}

const castService = new CastService();
export default castService;
