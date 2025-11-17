'use client';

import { YOUTUBE_API_URL } from '@/lib/config';
import apiKeyManager from './apiKeyManager';

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

function formatViews(views: string): string {
  const num = parseInt(views, 10);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
  return views;
}

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
    channelAvatarUrl: '',
  }));
}

async function fetchWithApiKeyRotation<T>(url: string): Promise<T> {
  const maxRetries = apiKeyManager.requestCounts ? Object.keys(apiKeyManager.requestCounts).length : 1;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const currentKey = apiKeyManager.getCurrentKey();
      if (currentKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
        console.warn('YouTube API key is not set.');
        return { items: [] } as unknown as T;
      }

      const fullUrl = `${url}&key=${currentKey}`;
      const response = await fetch(fullUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw { ...errorData, status: response.status };
      }

      apiKeyManager.markRequestSuccess();
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      attempt++;
      try {
        apiKeyManager.handleFailedRequest(error);
        console.log(`Retrying request... (${attempt}/${maxRetries})`);
      } catch (e) {
        console.error('All API keys failed. No more keys to switch to.');
        throw e;
      }
    }
  }
  throw new Error(`API request failed after ${maxRetries} retries.`);
}

export async function getTrendingVideos(maxResults = 12): Promise<FormattedVideo[]> {
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

export async function searchVideos(query: string, maxResults = 12): Promise<FormattedVideo[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video`
    );
    const videoIds = data.items
      .map((item: YouTubeVideoItem) => (typeof item.id === 'object' ? item.id.videoId : item.id))
      .join(',');
    if (!videoIds) return [];
    return getVideoDetails(videoIds);
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}
