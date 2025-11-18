'use client';

/**
 * NOTE: This service is a placeholder and is NOT functional with the current
 * YouTube <iframe> implementation.
 *
 * The code below outlines a sophisticated approach for background audio playback
 * using the MediaSession API, Service Workers, and other modern browser features.
 * However, this entire approach relies on having direct programmatic access
 * to a <video> element.
 *
 * Due to the browser's Same-Origin Policy, we cannot access the <video> tag
 * inside a cross-origin <iframe> (like the one from youtube.com). Therefore,
 * we cannot hook up its playback state to the MediaSession API or use tricks
 * like AudioContext to keep it alive in the background.
 *
 * The good news is that modern mobile browsers and the YouTube player itself
 * often handle background playback and media controls automatically, especially
_for users with YouTube Premium.
 *
 * This file is kept as a reference for a possible future implementation if the
 * app ever uses a direct video source instead of a YouTube embed.
 */

class BackgroundPlayService {
  constructor() {
    console.log(
      'BackgroundPlayService initialized (Note: Inactive due to YouTube <iframe> limitations).'
    );
  }

  isSupported(): boolean {
    if (typeof window !== 'undefined') {
      return (
        'mediaSession' in navigator &&
        'serviceWorker' in navigator
      );
    }
    return false;
  }

  setup(videoElement: HTMLVideoElement, videoInfo: any) {
    console.warn(
      'Cannot setup BackgroundPlayService: Direct access to the <video> element inside the YouTube iframe is not possible.'
    );
  }

  cleanup() {
    console.log('Cleaning up BackgroundPlayService.');
  }
}

const backgroundPlayService = new BackgroundPlayService();
export default backgroundPlayService;
