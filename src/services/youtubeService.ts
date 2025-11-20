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
  error?: string;
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

async function fetchWithApiKeyRotation<T extends { items: any[], nextPageToken?: string, error?: any }>(
  url: string,
  endpoint: 'search' | 'videos' | 'channels'
): Promise<T> {
  const maxRetries = apiKeyManager.keys.length > 0 ? apiKeyManager.keys.length : 1;
  let attempt = 0;

  while (attempt < maxRetries) {
    const currentKey = apiKeyManager.getCurrentKey();
    if (!currentKey) {
      throw new Error('Tidak ada kunci API YouTube yang valid. Mohon tambahkan di file .env.');
    }

    try {
      const fullUrl = `${url}&key=${currentKey}`;
      const response = await fetch(fullUrl);
      const data = await response.json();

      if (!response.ok) {
        // Lemparkan error dengan data agar bisa ditangkap di blok catch
        throw { data: data, status: response.status };
      }

      apiKeyManager.useKey(endpoint);
      return data;
    } catch (error: any) {
      console.error(
        `API request with key ${
          apiKeyManager.currentIndex + 1
        } failed:`,
        error
      );

      // Coba ekstrak pesan error dari berbagai kemungkinan format
      let errorMessage = 'Terjadi kesalahan pada API YouTube.';
      if (error?.data?.error?.message) {
        errorMessage = error.data.error.message;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      attempt++;
      apiKeyManager.markFailed();
      
      if (attempt >= maxRetries) {
        throw new Error(errorMessage);
      }
      console.log(`Retrying request... (${attempt}/${maxRetries})`);
    }
  }

  // Baris ini seharusnya tidak akan pernah tercapai, tapi untuk keamanan
  throw new Error(`Permintaan API gagal setelah ${maxRetries} kali percobaan.`);
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
  videoItems: YouTubeVideoItem[],
  existingVideoIds: Set<string>
): Promise<FormattedVideo[]> {
  if (!videoItems || videoItems.length === 0) return [];
  
  const uniqueVideoItems = videoItems.filter(video => {
    const videoId = typeof video.id === 'object' ? video.id.videoId : video.id;
    return !existingVideoIds.has(videoId);
  });

  const channelIds = uniqueVideoItems.map((video) => video.snippet.channelId);
  const channelAvatars = await fetchChannelAvatars(channelIds);
  return formatVideos(uniqueVideoItems, channelAvatars);
}

export async function getTrendingVideos(
  maxResults = 20,
  pageToken = '',
  existingVideoIds: Set<string>
): Promise<FetchResult> {
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&regionCode=ID&pageToken=${pageToken}`,
      'videos'
    );
    const videos = await processVideos(data.items, existingVideoIds);
    return { videos, nextPageToken: data.nextPageToken };
  } catch (error: any) {
    return { videos: [], error: error.message };
  }
}

async function getVideoDetails(videoIds: string): Promise<YouTubeVideoItem[]> {
  if (!videoIds) return [];
  try {
    const data: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
      'videos'
    );
    return data.items || [];
  } catch (error) {
    console.error('Error fetching video details:', error);
    return [];
  }
}

export async function searchVideos(
  query: string,
  maxResults = 20,
  pageToken = '',
  existingVideoIds: Set<string>
): Promise<FetchResult> {
  try {
    const searchData: any = await fetchWithApiKeyRotation(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&regionCode=ID&pageToken=${pageToken}`,
      'search'
    );

    const videoIds = (searchData.items || [])
      .map((item: YouTubeVideoItem) =>
        typeof item.id === 'object' ? item.id.videoId : item.id
      )
      .join(',');

    if (!videoIds) return { videos: [], nextPageToken: undefined };

    const videoDetails = await getVideoDetails(videoIds);
    const videoDetailsMap = new Map(videoDetails.map(video => [video.id, video]));

    const mergedDetails = (searchData.items || []).map((item: any) => {
        const detail = videoDetailsMap.get(item.id.videoId);
        if (detail) {
            // Gabungkan detail tanpa menimpa snippet dari pencarian
            return {
                ...item,
                ...detail,
                id: item.id.videoId, // Pastikan id adalah string
                snippet: {
                    ...item.snippet,
                    ...detail.snippet,
                },
            };
        }
        return {
          ...item,
          id: item.id.videoId
        };
    });

    const videos = await processVideos(mergedDetails, existingVideoIds);
    return { videos, nextPageToken: searchData.nextPageToken };
  } catch (error: any) {
    return { videos: [], error: error.message };
  }
}

export function getVideoEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}
