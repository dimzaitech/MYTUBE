'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type FormattedVideo } from '@/services/youtubeService';

interface QueueContextType {
  queue: FormattedVideo[];
  isQueueOpen: boolean;
  addToQueue: (video: FormattedVideo) => void;
  removeFromQueue: (videoId: string) => void;
  playNextInQueue: () => FormattedVideo | null;
  toggleQueue: () => void;
  setQueueOpen: (isOpen: boolean) => void;
  clearQueue: () => void;
  playFromQueue: (video: FormattedVideo) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<FormattedVideo[]>([]);
  const [isQueueOpen, setQueueOpen] = useState(false);

  const addToQueue = (video: FormattedVideo) => {
    setQueue((prevQueue) => {
      if (prevQueue.find((v) => v.id === video.id)) {
        return prevQueue; // Hindari duplikat
      }
      return [...prevQueue, video];
    });
  };

  const removeFromQueue = (videoId: string) => {
    setQueue((prevQueue) => prevQueue.filter((video) => video.id !== videoId));
  };

  const playNextInQueue = (): FormattedVideo | null => {
    if (queue.length === 0) return null;
    const nextVideo = queue[0];
    setQueue((prevQueue) => prevQueue.slice(1));
    return nextVideo;
  };
  
  const playFromQueue = (video: FormattedVideo) => {
    setQueue((prevQueue) => {
      const videoIndex = prevQueue.findIndex(v => v.id === video.id);
      if (videoIndex > -1) {
        return prevQueue.slice(videoIndex);
      }
      return prevQueue;
    });
  };


  const toggleQueue = () => {
    setQueueOpen((prev) => !prev);
  };
  
  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        isQueueOpen,
        addToQueue,
        removeFromQueue,
        playNextInQueue,
        toggleQueue,
        setQueueOpen,
        clearQueue,
        playFromQueue
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
