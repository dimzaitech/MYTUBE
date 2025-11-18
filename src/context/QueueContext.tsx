'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { type FormattedVideo } from '@/services/youtubeService';

interface QueueContextType {
  queue: FormattedVideo[];
  isQueueOpen: boolean;
  videoToPlay: FormattedVideo | null;
  addToQueue: (video: FormattedVideo) => void;
  removeFromQueue: (videoId: string) => void;
  playNextInQueue: () => FormattedVideo | null;
  toggleQueue: () => void;
  setQueueOpen: (isOpen: boolean) => void;
  clearQueue: () => void;
  playFromQueue: (video: FormattedVideo) => void;
  clearVideoToPlay: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<FormattedVideo[]>([]);
  const [isQueueOpen, setQueueOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<FormattedVideo | null>(null);


  const addToQueue = (video: FormattedVideo) => {
    setQueue((prevQueue) => {
      if (prevQueue.find((v) => v.id === video.id)) {
        return prevQueue;
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
  
  const playFromQueue = useCallback((video: FormattedVideo) => {
    const videoIndex = queue.findIndex(v => v.id === video.id);
    if (videoIndex > -1) {
      setVideoToPlay(video);
      setQueue(prevQueue => prevQueue.slice(videoIndex));
    }
  }, [queue]);
  
  const clearVideoToPlay = useCallback(() => {
    setVideoToPlay(null);
  }, []);

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
        videoToPlay,
        addToQueue,
        removeFromQueue,
        playNextInQueue,
        toggleQueue,
        setQueueOpen,
        clearQueue,
        playFromQueue,
        clearVideoToPlay,
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
