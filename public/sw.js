// Service Worker for background play
// NOTE: This service worker is part of a non-functional background playback
// feature. It is kept for reference but does not actively control video
// playback due to browser security restrictions with YouTube iframes.

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PLAY_VIDEO') {
    // This is where background play logic would be handled.
    console.log('Background play message received (inactive).');
  }
});
