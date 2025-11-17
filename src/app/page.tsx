import VideoGrid from '@/components/videos/video-grid';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Video = {
  id: string;
  title: string;
  channelName: string;
  channelAvatarUrl: string;
  views: string;
  uploadedAt: string;
  duration: string;
  thumbnailUrl: string;
};

const videoThumbnails = PlaceHolderImages.filter((img) =>
  img.id.startsWith('video')
);
const channelAvatars = PlaceHolderImages.filter((img) =>
  img.id.startsWith('avatar')
);

const videos: Video[] = [
  {
    id: '1',
    title: 'Exploring the Alps: A Scenic Journey',
    channelName: 'NatureVibes',
    views: '1.2M',
    uploadedAt: '2 weeks ago',
    duration: '15:30',
    thumbnailUrl: videoThumbnails[0]?.imageUrl,
    channelAvatarUrl: channelAvatars[0]?.imageUrl,
  },
  {
    id: '2',
    title: 'Ultimate Productivity Hacks for 2024',
    channelName: 'LifeOptimize',
    views: '890K',
    uploadedAt: '5 days ago',
    duration: '08:45',
    thumbnailUrl: videoThumbnails[1]?.imageUrl,
    channelAvatarUrl: channelAvatars[1]?.imageUrl,
  },
  {
    id: '3',
    title: 'How to Cook Perfect Pasta from Scratch',
    channelName: 'ChefMaster',
    views: '2.5M',
    uploadedAt: '1 month ago',
    duration: '12:18',
    thumbnailUrl: videoThumbnails[2]?.imageUrl,
    channelAvatarUrl: channelAvatars[2]?.imageUrl,
  },
  {
    id: '4',
    title: 'A Deep Dive into React Server Components',
    channelName: 'CodeWizard',
    views: '450K',
    uploadedAt: '3 days ago',
    duration: '45:10',
    thumbnailUrl: videoThumbnails[3]?.imageUrl,
    channelAvatarUrl: channelAvatars[3]?.imageUrl,
  },
  {
    id: '5',
    title: 'DIY Home Decor on a Budget',
    channelName: 'CreativeHome',
    views: '675K',
    uploadedAt: '1 week ago',
    duration: '10:05',
    thumbnailUrl: videoThumbnails[4]?.imageUrl,
    channelAvatarUrl: channelAvatars[0]?.imageUrl,
  },
  {
    id: '6',
    title: 'The Future of Electric Cars: A 2024 Review',
    channelName: 'TechForward',
    views: '1.8M',
    uploadedAt: '1 day ago',
    duration: '22:40',
    thumbnailUrl: videoThumbnails[5]?.imageUrl,
    channelAvatarUrl: channelAvatars[1]?.imageUrl,
  },
  {
    id: '7',
    title: 'Beginner\'s Guide to Digital Painting',
    channelName: 'ArtFlow',
    views: '320K',
    uploadedAt: '2 months ago',
    duration: '35:20',
    thumbnailUrl: videoThumbnails[6]?.imageUrl,
    channelAvatarUrl: channelAvatars[2]?.imageUrl,
  },
  {
    id: '8',
    title: 'Unbelievable Gaming Moments of the Year',
    channelName: 'GameVault',
    views: '3.1M',
    uploadedAt: '6 days ago',
    duration: '18:55',
    thumbnailUrl: videoThumbnails[7]?.imageUrl,
    channelAvatarUrl: channelAvatars[3]?.imageUrl,
  },
  {
    id: '9',
    title: 'A Tour of the Most Modern Cities',
    channelName: 'UrbanExplorer',
    views: '950K',
    uploadedAt: '10 days ago',
    duration: '14:25',
    thumbnailUrl: videoThumbnails[8]?.imageUrl,
    channelAvatarUrl: channelAvatars[0]?.imageUrl,
  },
  {
    id: '10',
    title: 'Mastering CSS Grid in 20 Minutes',
    channelName: 'WebDevSimplified',
    views: '1.1M',
    uploadedAt: '3 weeks ago',
    duration: '20:00',
    thumbnailUrl: videoThumbnails[9]?.imageUrl,
    channelAvatarUrl: channelAvatars[1]?.imageUrl,
  },
  {
    id: '11',
    title: 'The Physics of Black Holes Explained',
    channelName: 'AstroGeek',
    views: '4.2M',
    uploadedAt: '4 days ago',
    duration: '25:00',
    thumbnailUrl: videoThumbnails[10]?.imageUrl,
    channelAvatarUrl: channelAvatars[2]?.imageUrl,
  },
  {
    id: '12',
    title: 'Hilarious Animal Fails Compilation',
    channelName: 'FunnyFauna',
    views: '5.5M',
    uploadedAt: '2 days ago',
    duration: '09:30',
    thumbnailUrl: videoThumbnails[11]?.imageUrl,
    channelAvatarUrl: channelAvatars[3]?.imageUrl,
  },
];

export default function Home() {
  return <VideoGrid videos={videos} />;
}
