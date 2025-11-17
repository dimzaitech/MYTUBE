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

function formatVideos(
  videos: YouTubeVideoItem[],
  channelAvatars: Record<string, string>
): FormattedVideo[] {
  if (!videos) return [];
  return videos.map((video) => ({
    id: typeof video.id === 'object' ? video.id.videoId : video.id,
    title: video.snippet.title,
    channelName: video.snippet.channelTitle,
    views: formatViews(video.statistics?.viewCount || '0'),
    uploadedAt: formatTimeAgo(video.snippet.publishedAt),
    duration: formatDuration(video.contentDetails?.duration),
    thumbnailUrl: video.snippet.thumbnails.high.url,
    channelAvatarUrl: channelAvatars[video.snippet.channelId] || '',
  }));
}

async function fetchWithApiKeyRotation<T extends { items: any[] }>(
  url: string
): Promise<T> {
  const maxRetries = apiKeyManager.apiKeys.length;
  let attempt = 0;

  while (attempt < maxRetries) {
    const currentKey = apiKeyManager.getCurrentKey();
    if (currentKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
      console.warn('YouTube API key is not set.');
      return { items: [] } as T;
    }

    try {
      const fullUrl = `${url}&key=${currentKey}`;
      const response = await fetch(fullUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw { ...errorData, status: response.status };
      }

      apiKeyManager.markRequestSuccess();
      return await response.json();
    } catch (error: any) {
      console.error(`API request with key ${apiKeyManager.currentKeyIndex + 1} failed:`, error);
      attempt++;
      try {
        apiKeyManager.handleFailedRequest(error); // This will switch the key
        console.log(`Retrying request... (${attempt}/${maxRetries})`);
      } catch (e) {
        console.error('All API keys failed. No more keys to switch to.');
        throw e; // Re-throw the final error
      }
    }
  }

  throw new Error(`API request failed after ${maxRetries} retries.`);
}

async function fetchChannelAvatars(
  channelIds: string[]
): Promise<Record<string, string>> {
  if (channelIds.length === 0) return {};
  const uniqueChannelIds = [...new Set(channelIds)];

  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/channels?part=snippet&id=${uniqueChannelIds.join(',')}`
    );
    const avatars: Record<string, string> = {};
    if (data.items) {
      data.items.forEach((channel: any) => {
        avatars[channel.id] = channel.snippet.thumbnails.default.url;
      });
    }
    return avatars;
  } catch (error) {
    console.error('Error fetching channel avatars:', error);
    return {}; // Return empty object on failure
  }
}

async function processVideos(
  videoItems: YouTubeVideoItem[]
): Promise<FormattedVideo[]> {
  if (!videoItems || videoItems.length === 0) return [];
  
  const channelIds = videoItems.map((video) => video.snippet.channelId);
  const channelAvatars = await fetchChannelAvatars(channelIds);
  return formatVideos(videoItems, channelAvatars);
}

export async function getTrendingVideos(
  maxResults = 12
): Promise<FormattedVideo[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}`
    );
    return await processVideos(data.items);
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

async function getVideoDetails(videoIds: string): Promise<YouTubeVideoItem[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}`
    );
    return data.items;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return [];
  }
}

export async function searchVideos(
  query: string,
  maxResults = 12
): Promise<FormattedVideo[]> {
  try {
    const searchData: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video`
    );

    const videoIds = searchData.items
      .map((item: YouTubeVideoItem) =>
        typeof item.id === 'object' ? item.id.videoId : item.id
      )
      .join(',');

    if (!videoIds) return [];

    const videoDetails = await getVideoDetails(videoIds);
    return await processVideos(videoDetails);
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}
