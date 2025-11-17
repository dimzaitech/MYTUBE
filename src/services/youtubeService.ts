'use server';

import { YOUTUBE_API_KEY, YOUTUBE_API_URL } from '@/lib/config';

// Definisikan tipe untuk data video yang sudah diformat
export type FormattedVideo = {
  id: string;
  title: string;
  channelName: string;
  views: string;
  uploadedAt: string;
  duration: string;
  thumbnailUrl: string;
  channelAvatarUrl: string; // Akan ditambahkan nanti
};

// Definisikan tipe untuk item dari YouTube API
type YouTubeVideoItem = {
  id: string | { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
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

class YouTubeService {
  // Ambil trending videos
  async getTrendingVideos(maxResults = 12): Promise<FormattedVideo[]> {
    if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      console.warn('YouTube API key is not set. Using mock data.');
      return [];
    }
    try {
      const response = await fetch(
        `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching trending videos:', errorData);
        return [];
      }
      const data = await response.json();
      return this.formatVideos(data.items);
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      return [];
    }
  }

  // Search videos
  async searchVideos(query: string, maxResults = 12): Promise<FormattedVideo[]> {
     if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      console.warn('YouTube API key is not set. Using mock data.');
      return [];
    }
    try {
      const response = await fetch(
        `${YOUTUBE_API_URL}/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video&key=${YOUTUBE_API_KEY}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error searching videos:', errorData);
        return [];
      }
      const data = await response.json();

      const videoIds = data.items
        .map((item: YouTubeVideoItem) => (typeof item.id === 'object' ? item.id.videoId : item.id))
        .join(',');
        
      if (!videoIds) return [];

      const videoDetails = await this.getVideoDetails(videoIds);
      return videoDetails;
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }

  // Ambil detail video berdasarkan ID
  async getVideoDetails(videoIds: string): Promise<FormattedVideo[]> {
    try {
      const response = await fetch(
        `${YOUTUBE_API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
       if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching video details:', errorData);
        return [];
      }
      const data = await response.json();
      return this.formatVideos(data.items);
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  }

  // Format data video ke struktur yang kita butuhkan
  private formatVideos(videos: YouTubeVideoItem[]): FormattedVideo[] {
    if (!videos) return [];
    return videos.map((video) => ({
      id: typeof video.id === 'object' ? video.id.videoId : video.id,
      title: video.snippet.title,
      channelName: video.snippet.channelTitle,
      views: this.formatViews(video.statistics?.viewCount || '0'),
      uploadedAt: this.formatTimeAgo(video.snippet.publishedAt),
      duration: this.formatDuration(video.contentDetails?.duration),
      thumbnailUrl: video.snippet.thumbnails.high.url,
      channelAvatarUrl: '', // Placeholder, will be fetched separately
    }));
  }

  // Format number views
  private formatViews(views: string): string {
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
  private formatTimeAgo(publishedAt: string): string {
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
  private formatDuration(duration?: string): string {
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
}

const youtubeService = new YouTubeService();
export default youtubeService;
