// Konfigurasi untuk Next.js
export const YOUTUBE_API_KEYS = {
  KEY_1: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_1,
  KEY_2: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_2,
  KEY_3: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_3,
  KEY_4: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_4,
  KEY_5: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_5,
};

export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Validasi
const validKeys = Object.values(YOUTUBE_API_KEYS).filter(
  (key) => key && key !== 'YOUR_YOUTUBE_API_KEY_HERE'
);
if (typeof window !== 'undefined' && validKeys.length === 0) {
  console.warn(
    'No valid YouTube API keys found in .env. Please add them with NEXT_PUBLIC_ prefix.'
  );
}
