'use client';

import { useQueue } from '@/context/QueueContext';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function RecommendationSidebar() {
  const { queue, playFromQueue, removeFromQueue, clearQueue, selectedVideo } = useQueue();

  if (!selectedVideo || queue.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-xl border bg-secondary p-4">
        <h3 className="text-lg font-semibold text-foreground">Antrean</h3>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Antrean kosong.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-secondary">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-lg font-semibold text-foreground">Berikutnya</h3>
        <Button variant="ghost" size="sm" onClick={clearQueue}>
          Hapus Semua
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-border">
          {queue.map((video) => (
            <li
              key={video.id}
              className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-accent"
              onClick={() => playFromQueue(video)}
            >
              <div className="relative h-14 w-24 flex-shrink-0">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {video.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {video.channelName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromQueue(video.id);
                }}
                title="Hapus dari antrean"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
