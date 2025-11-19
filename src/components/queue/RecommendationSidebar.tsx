'use client';

import { useQueue } from '@/context/QueueContext';
import { Button } from '@/components/ui/button';
import { X, Trash2, ListMusic } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function RecommendationSidebar() {
  const { queue, removeFromQueue, clearQueue, playFromQueue, selectedVideo } = useQueue();

  return (
    <div className={cn('flex h-full flex-col bg-background recommendation-sidebar-list')}>
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold sidebar-title">Berikutnya</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearQueue}
          disabled={queue.length === 0}
          title="Kosongkan antrean"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {queue.length > 0 ? (
          <div className="flex flex-col gap-2 p-2">
            {queue.map((video) => (
              <div
                key={video.id}
                className="sidebar-video-item group flex cursor-pointer gap-2 rounded-lg p-2 hover:bg-accent"
                onClick={() => playFromQueue(video)}
              >
                <div className="relative h-[94px] w-[168px] shrink-0 overflow-hidden rounded-md sidebar-thumbnail">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 overflow-hidden sidebar-video-info">
                  <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground sidebar-video-title">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sidebar-channel-name">
                    {video.channelName}
                  </p>
                  <p className="text-xs text-muted-foreground sidebar-video-views">
                    {video.views}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(video.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <ListMusic className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-medium">Antrean kosong</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tambahkan video untuk diputar selanjutnya.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
