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

type FetchResult = {
  videos: FormattedVideo[];
  nextPageToken?: string;
};

function formatViews(views?: string): string {
  if (!views) return '0 tayangan';
  const num = parseInt(views, 10);
  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1) + 'Mrd x ditonton';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + ' jt x ditonton';
  if (num >= 1_000) return (num / 1_000).toFixed(0) + ' rb x ditonton';
  return views + ' x ditonton';
}

function formatTimeAgo(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' tahun yang lalu';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' bulan yang lalu';
  interval = seconds / 86400;
  if (interval > 2) return Math.floor(interval) + ' hari yang lalu';
  if (interval > 1) return '1 hari yang lalu';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' jam yang lalu';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' menit yang lalu';
  return 'baru saja';
}

function formatDuration(duration?: string): string {
  if (!duration) return '0:00';
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1]?.slice(0, -1) || '0', 10);
  const minutes = parseInt(match[2]?.slice(0, -1) || '0', 10);
  const seconds = parseInt(match[3]?.slice(0, -1) || '0', 10);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
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
    views: formatViews(video.statistics?.viewCount),
    uploadedAt: formatTimeAgo(video.snippet.publishedAt),
    duration: formatDuration(video.contentDetails?.duration),
    thumbnailUrl: video.snippet.thumbnails.high.url,
    channelAvatarUrl: channelAvatars[video.snippet.channelId] || '',
  }));
}

async function fetchWithApiKeyRotation<T extends { items: any[], nextPageToken?: string }>(
  url: string,
  endpoint: 'search' | 'videos' | 'channels'
): Promise<T> {
  const maxRetries = apiKeyManager.keys.length;
  let attempt = 0;

  while (attempt < maxRetries) {
    const currentKey = apiKeyManager.getCurrentKey();
    if (!currentKey) {
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

      apiKeyManager.useKey(endpoint);
      return await response.json();
    } catch (error: any) {
      console.error(
        `API request with key ${
          apiKeyManager.currentIndex + 1
        } failed:`,
        error
      );
      attempt++;
      apiKeyManager.markFailed();
      if (attempt >= maxRetries) {
        throw new Error(`API request failed after ${maxRetries} retries.`);
      }
      console.log(`Retrying request... (${attempt}/${maxRetries})`);
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
      `${YOUTUBE_API_URL}/channels?part=snippet&id=${uniqueChannelIds.join(
        ','
      )}`, 'channels'
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
    return {};
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
  maxResults = 20,
  pageToken = ''
): Promise<FetchResult> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&regionCode=ID&pageToken=${pageToken}`,
      'videos'
    );
    const videos = await processVideos(data.items);
    return { videos, nextPageToken: data.nextPageToken };
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return { videos: [] };
  }
}

async function getVideoDetails(videoIds: string): Promise<YouTubeVideoItem[]> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
      'videos'
    );
    return data.items;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return [];
  }
}

export async function searchVideos(
  query: string,
  maxResults = 20,
  pageToken = ''
): Promise<FetchResult> {
  try {
    const searchData: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video&regionCode=ID&pageToken=${pageToken}`,
      'search'
    );

    const videoIds = searchData.items
      .map((item: YouTubeVideoItem) =>
        typeof item.id === 'object' ? item.id.videoId : item.id
      )
      .join(',');

    if (!videoIds) return { videos: [], nextPageToken: undefined };

    const videoDetails = await getVideoDetails(videoIds);

    const searchResultsMap = new Map(
      searchData.items.map((item: any) => [item.id.videoId, item.snippet])
    );

    const mergedDetails = videoDetails.map((detail) => {
      const searchSnippet = searchResultsMap.get(detail.id as string);
      if (searchSnippet) {
        detail.snippet = { ...detail.snippet, ...searchSnippet };
      }
      return detail;
    });

    const videos = await processVideos(mergedDetails);
    return { videos, nextPageToken: searchData.nextPageToken };
  } catch (error) {
    console.error('Error searching videos:', error);
    return { videos: [] };
  }
}

export function getVideoEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}
