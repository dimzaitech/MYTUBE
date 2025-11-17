'use client';

class ApiKeyManager {
  public keys: string[] = [];
  public currentIndex: number = 0;
  public usedCount: Record<number, number> = {};

  constructor() {
    this.keys = [
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_1,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_2,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_3,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_4,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_5,
    ].filter((key): key is string => !!key);

    // Default values untuk server rendering
    this.currentIndex = 0;
    this.usedCount = {};

    // Initialize hanya di client
    if (typeof window !== 'undefined') {
      this.initializeClient();
    }
  }

  initializeClient() {
    this.keys.forEach((_, i) => {
      this.usedCount[i] = this.getStoredCount(i);
    });

    this.startResetTimer();
  }

  getStoredCount(index: number): number {
    try {
      return parseInt(localStorage.getItem(`yt_key_${index}`) || '0', 10);
    } catch {
      return 0;
    }
  }

  storeCount(index: number, count: number) {
    try {
      localStorage.setItem(`yt_key_${index}`, count.toString());
    } catch (error) {
      console.warn('Failed to store count:', error);
    }
  }

  startResetTimer() {
    // Reset setiap 24 jam
    setInterval(() => {
      this.resetAllCounts();
    }, 24 * 60 * 60 * 1000);
  }

  getCurrentKey(): string | undefined {
    return this.keys[this.currentIndex];
  }

  useKey() {
    if (typeof window === 'undefined') return;

    const currentCount = (this.usedCount[this.currentIndex] || 0) + 1;
    this.usedCount[this.currentIndex] = currentCount;
    this.storeCount(this.currentIndex, currentCount);

    if (currentCount > 8000) {
      this.switchToNextKey();
    }
  }

  switchToNextKey() {
    if (this.keys.length === 0) return;

    for (let i = 1; i <= this.keys.length; i++) {
      const nextIndex = (this.currentIndex + i) % this.keys.length;
      if ((this.usedCount[nextIndex] || 0) < 9000) {
        this.currentIndex = nextIndex;
        return;
      }
    }
  }

  markFailed() {
    if (typeof window === 'undefined') return;
    this.switchToNextKey();
  }

  resetAllCounts() {
    if (typeof window === 'undefined') return;

    console.log('🔄 Resetting all API key counts...');
    this.keys.forEach((_, i) => {
      this.usedCount[i] = 0;
      this.storeCount(i, 0);
    });
    this.currentIndex = 0;
  }

  getStatus() {
    return {
      currentKey: this.currentIndex + 1,
      totalKeys: this.keys.length,
      usedCounts: { ...this.usedCount }, // Return copy
    };
  }
}

const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;
