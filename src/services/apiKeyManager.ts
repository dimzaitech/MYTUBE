'use client';

// Biaya kuota untuk setiap jenis endpoint YouTube API
const QUOTA_COST = {
  search: 100,
  videos: 1,
  channels: 1,
  playlists: 1,
  default: 1,
};

type QuotaUsage = {
  used: number;
  lastReset: number;
};

class ApiKeyManager {
  public keys: string[] = [];
  public currentIndex: number = 0;
  public usedCount: Record<number, QuotaUsage> = {};
  public dailyLimit: number = 9000;
  public resetIntervalHours: number = 24;

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
    this.dailyLimit =
      parseInt(process.env.NEXT_PUBLIC_MAX_REQUESTS_PER_KEY || '9000', 10) ||
      9000;
    this.resetIntervalHours =
      parseInt(process.env.NEXT_PUBLIC_QUOTA_RESET_HOURS || '24', 10) || 24;

    this.keys.forEach((_, i) => {
      this.usedCount[i] = this.getStoredCount(i);
      this.checkAndResetQuota(i);
    });

    this.switchToNextAvailableKey();
  }

  getStoredCount(index: number): QuotaUsage {
    try {
      const storedData = localStorage.getItem(`yt_key_${index}_usage`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch {
      // Abaikan error parsing
    }
    return { used: 0, lastReset: Date.now() };
  }

  storeCount(index: number, usage: QuotaUsage) {
    try {
      localStorage.setItem(`yt_key_${index}_usage`, JSON.stringify(usage));
    } catch (error) {
      console.warn('Failed to store usage count:', error);
    }
  }

  checkAndResetQuota(index: number) {
    const usage = this.usedCount[index];
    const resetMs = this.resetIntervalHours * 60 * 60 * 1000;
    if (Date.now() - usage.lastReset > resetMs) {
      console.log(`Auto-resetting quota for Key ${index + 1}`);
      usage.used = 0;
      usage.lastReset = Date.now();
      this.storeCount(index, usage);
    }
  }

  getCurrentKey(): string | undefined {
    return this.keys[this.currentIndex];
  }

  useKey(endpoint: keyof typeof QUOTA_COST = 'default') {
    if (typeof window === 'undefined') return;

    this.checkAndResetQuota(this.currentIndex);

    const cost = QUOTA_COST[endpoint] || QUOTA_COST.default;
    const usage = this.usedCount[this.currentIndex];

    usage.used += cost;
    this.storeCount(this.currentIndex, usage);

    console.log(
      `Using Key ${this.currentIndex + 1}. Cost: ${cost}. Total Used: ${
        usage.used
      }`
    );

    if (usage.used >= this.dailyLimit) {
      console.warn(
        `Key ${this.currentIndex + 1} has reached its daily limit.`
      );
      this.switchToNextAvailableKey();
    }
  }

  switchToNextAvailableKey(): boolean {
    if (this.keys.length === 0) return false;

    for (let i = 0; i < this.keys.length; i++) {
      const nextIndex = (this.currentIndex + i) % this.keys.length;
      this.checkAndResetQuota(nextIndex);
      if ((this.usedCount[nextIndex]?.used || 0) < this.dailyLimit) {
        if (this.currentIndex !== nextIndex) {
          console.log(`Switching to Key ${nextIndex + 1}`);
          this.currentIndex = nextIndex;
        }
        return true;
      }
    }

    console.error('All API keys have reached their daily limit.');
    return false;
  }

  markFailed() {
    if (typeof window === 'undefined') return;
    console.warn(
      `Key ${this.currentIndex + 1} failed. Switching to next available key.`
    );
    // Tandai kunci saat ini hampir habis untuk memaksa pergantian
    const usage = this.usedCount[this.currentIndex];
    if (usage) {
      usage.used = this.dailyLimit;
      this.storeCount(this.currentIndex, usage);
    }
    this.switchToNextAvailableKey();
  }

  resetAllCounts() {
    if (typeof window === 'undefined') return;

    console.log('🔄 Resetting all API key counts...');
    this.keys.forEach((_, i) => {
      const newUsage = { used: 0, lastReset: Date.now() };
      this.usedCount[i] = newUsage;
      this.storeCount(i, newUsage);
    });
    this.currentIndex = 0;
    console.log('All counts reset. Switched to Key 1.');
  }

  getStatus() {
    const now = Date.now();
    const resetMs = this.resetIntervalHours * 60 * 60 * 1000;

    const keysInfo = this.keys.map((_, index) => {
      this.checkAndResetQuota(index); // Pastikan data terbaru
      const usage = this.usedCount[index] || {
        used: 0,
        lastReset: now,
      };
      const nextReset = usage.lastReset + resetMs;
      const hoursUntilReset = Math.max(
        0,
        Math.ceil((nextReset - now) / (60 * 60 * 1000))
      );
      const isExhausted = usage.used >= this.dailyLimit;

      return {
        index: index,
        isActive: this.currentIndex === index && !isExhausted,
        used: usage.used,
        limit: this.dailyLimit,
        status: isExhausted ? 'exhausted' : 'active',
        nextResetHours: hoursUntilReset,
        percentage: Math.min(100, (usage.used / this.dailyLimit) * 100),
      };
    });

    const totalUsed = keysInfo.reduce((sum, key) => sum + key.used, 0);
    const totalLimit = keysInfo.length * this.dailyLimit;

    return {
      currentKeyIndex: this.currentIndex,
      totalKeys: this.keys.length,
      keys: keysInfo,
      totalUsed,
      totalLimit,
      lastUpdated: new Date().toISOString(),
    };
  }
}

const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;
