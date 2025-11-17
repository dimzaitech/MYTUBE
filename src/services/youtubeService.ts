'use server';

import { YOUTUBE_API_URL } from '@/lib/config';
import apiKeyManager from './apiKeyManager';

// Definisikan tipe untuk data video yang sudah diformat
export type FormattedVideo = {
  id: string;
  title: string;
  channelName: string;
  views: string;
  uploadedAt: string;
  duration: string;
  thumbnailUrl: string;
  channelAvatarUrl: string;
};

// Definisikan tipe untuk item dari YouTube API
type YouTubeVideoItem = {
  id: string | { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelId: string;
  };
  statistics?: {
    viewCount: string;
  };
  contentDetails?: {
    duration: string;
  };
};

// --- Helper Functions ---

// Format number views
function formatViews(views: string): string {
  const num = parseInt(views, 10);
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + 'K';
  }
  return views;
}

// Format waktu upload
function formatTimeAgo(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
}

// Format duration video
function formatDuration(duration?: string): string {
  if (!duration) return '0:00';

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1]?.slice(0, -1) || '0', 10);
  const minutes = parseInt(match[2]?.slice(0, -1) || '0', 10);
  const seconds = parseInt(match[3]?.slice(0, -1) || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format data video ke struktur yang kita butuhkan
function formatVideos(videos: YouTubeVideoItem[]): FormattedVideo[] {
  if (!videos) return [];
  return videos.map((video) => ({
    id: typeof video.id === 'object' ? video.id.videoId : video.id,
    title: video.snippet.title,
    channelName: video.snippet.channelTitle,
    views: formatViews(video.statistics?.viewCount || '0'),
    uploadedAt: formatTimeAgo(video.snippet.publishedAt),
    duration: formatDuration(video.contentDetails?.duration),
    thumbnailUrl: video.snippet.thumbnails.high.url,
    channelAvatarUrl: '', // Placeholder, will be fetched separately
  }));
}

// --- Generic Fetch Function ---

async function fetchWithApiKeyRotation<T>(
  url: string,
  retryCount = 3
): Promise<T> {
  const YOUTUBE_API_KEY = await apiKeyManager.getCurrentKey();
  if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    console.warn('YouTube API key is not set. Using mock data.');
    return { items: [] } as unknown as T;
  }

  try {
    const fullUrl = `${url}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(fullUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw { ...errorData, status: response.status };
    }

    await apiKeyManager.markRequestSuccess();
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    await apiKeyManager.handleFailedRequest(error);

    if (retryCount > 0) {
      console.log(`Retrying request... (${retryCount} attempts left)`);
      return fetchWithApiKeyRotation(url, retryCount - 1);
    } else {
      console.error('API request failed after multiple retries.');
      throw error;
    }
  }
}

// --- Exported API Functions ---

// Ambil trending videos
async function getTrendingVideos(
  maxResults = 12
): Promise<FormattedVideo[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}`
    );
    return formatVideos(data.items);
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

// Ambil detail video berdasarkan ID
async function getVideoDetails(videoIds: string): Promise<FormattedVideo[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}`
    );
    return formatVideos(data.items);
  } catch (error) {
    console.error('Error fetching video details:', error);
    return [];
  }
}

// Search videos
async function searchVideos(
  query: string,
  maxResults = 12
): Promise<FormattedVideo[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video`
    );

    const videoIds = data.items
      .map((item: YouTubeVideoItem) =>
        typeof item.id === 'object' ? item.id.videoId : item.id
      )
      .join(',');

    if (!videoIds) return [];

    return getVideoDetails(videoIds);
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}

const youtubeService = {
  getTrendingVideos,
  searchVideos,
};

export default youtubeService;
