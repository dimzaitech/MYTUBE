'use client';

import { useQueue } from '@/context/QueueContext';
import { Button } from '@/components/ui/button';
import { X, Trash2, ListMusic } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function RecommendationSidebar() {
  const { queue, isQueueOpen, toggleQueue, removeFromQueue, clearQueue, playFromQueue, selectedVideo } = useQueue();

  return (
    <div className={cn(
      "hidden lg:block shrink-0 border-l bg-background transition-all duration-300 ease-in-out",
      isQueueOpen && selectedVideo ? 'w-96' : 'w-0'
      )}>
      <div className={cn("flex h-full flex-col", isQueueOpen && selectedVideo ? 'opacity-100' : 'opacity-0 invisible')}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Berikutnya</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearQueue}
              disabled={queue.length === 0}
              title="Kosongkan antrean"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleQueue}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {queue.length > 0 ? (
            <div className="p-2 flex flex-col gap-2">
              {queue.map((video) => (
                <div
                  key={video.id}
                  className="group flex cursor-pointer gap-3 rounded-lg p-2.5 bg-card hover:bg-accent"
                  onClick={() => playFromQueue(video)}
                >
                  <div className="relative h-[68px] w-[120px] shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {video.channelName}
                    </p>
                     <p className="text-xs text-muted-foreground">
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
    </div>
  );
}
