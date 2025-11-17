import VideoCard from './video-card';
import type { FormattedVideo } from '@/services/youtubeService';

export default function VideoGrid({ videos }: { videos: FormattedVideo[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
