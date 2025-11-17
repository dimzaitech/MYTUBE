'use client';

class ApiKeyManager {
  private apiKeys: string[] = [];
  public currentKeyIndex: number = 0;
  private failedKeys: Set<number> = new Set();
  public requestCounts: Record<number, number> = {};
  private lastResetTime: Date = new Date();
  public maxRequestsPerKey: number = 9000;
  private quotaResetHours: number = 24;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  initialize() {
    this.apiKeys = [
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_1,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_2,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_3,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_4,
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_5,
    ]
      .filter(
        (key): key is string => !!key && key !== 'YOUR_YOUTUBE_API_KEY_HERE'
      )
      .filter(Boolean);

    this.lastResetTime = this.getStoredResetTime();
    this.failedKeys = this.getStoredFailedKeys();

    this.apiKeys.forEach((_, index) => {
      this.requestCounts[index] = this.getStoredRequestCount(index);
    });

    this.maxRequestsPerKey =
      parseInt(process.env.NEXT_PUBLIC_MAX_REQUESTS_PER_KEY || '9000', 10);
    this.quotaResetHours =
      parseInt(process.env.NEXT_PUBLIC_QUOTA_RESET_HOURS || '24', 10);

    this.startAutoReset();

    if (this.apiKeys.length === 0) {
      console.warn('No valid YouTube API keys found in .env file.');
    } else {
        this.currentKeyIndex = this.getStoredCurrentKeyIndex();
    }
  }

  // --- Local Storage Methods ---
  private getStoredValue<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStoredValue<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to store ${key}:`, error);
    }
  }

  private getStoredRequestCount = (keyIndex: number) => this.getStoredValue(`youtube_api_requests_${keyIndex}`, 0);
  private getStoredResetTime = () => new Date(this.getStoredValue('youtube_api_last_reset', new Date().toISOString()));
  private getStoredFailedKeys = () => new Set<number>(this.getStoredValue('youtube_api_failed_keys', []));
  private getStoredCurrentKeyIndex = () => this.getStoredValue('youtube_api_current_index', 0);
  
  private storeRequestCount = (keyIndex: number, count: number) => this.setStoredValue(`youtube_api_requests_${keyIndex}`, count);
  private storeResetTime = () => {
      const now = new Date();
      this.lastResetTime = now;
      this.setStoredValue('youtube_api_last_reset', now.toISOString());
  };
  private storeFailedKeys = () => this.setStoredValue('youtube_api_failed_keys', Array.from(this.failedKeys));
  private storeCurrentKeyIndex = () => this.setStoredValue('youtube_api_current_index', this.currentKeyIndex);


  // --- Core Logic ---
  private startAutoReset() {
    setInterval(() => this.checkAndResetQuotas(), 60 * 60 * 1000);
    this.checkAndResetQuotas();
  }

  private checkAndResetQuotas() {
    const now = new Date();
    const hoursSinceReset = (now.getTime() - this.lastResetTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReset >= this.quotaResetHours) {
      console.log(`🔄 ${this.quotaResetHours} hours passed, resetting all API keys...`);
      this.resetAllKeys();
    }
  }

  public getCurrentKey(): string {
    if (this.apiKeys.length === 0) {
      return 'YOUR_YOUTUBE_API_KEY_HERE';
    }
    return this.apiKeys[this.currentKeyIndex];
  }

  public getNextKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available.');
    }
    
    for (let i = 1; i <= this.apiKeys.length; i++) {
      const nextIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
      if (!this.failedKeys.has(nextIndex) && this.requestCounts[nextIndex] < this.maxRequestsPerKey) {
        this.currentKeyIndex = nextIndex;
        this.storeCurrentKeyIndex();
        console.log(`Switched to API Key ${this.currentKeyIndex + 1}`);
        return this.apiKeys[this.currentKeyIndex];
      }
    }
    throw new Error('All API keys quota exceeded or have failed.');
  }

  public markKeyFailed() {
    const keyIndex = this.currentKeyIndex;
    if (!this.failedKeys.has(keyIndex)) {
      this.failedKeys.add(keyIndex);
      this.storeFailedKeys();
      console.warn(`❌ API Key ${keyIndex + 1} marked as failed`);
    }
  }

  public handleFailedRequest(error: any): void {
    const isQuotaError =
      error?.message?.includes('quota') ||
      error?.message?.includes('exceeded') ||
      error?.status === 403;

    if (isQuotaError) {
      this.markKeyFailed();
    }
    
    this.getNextKey();
  }

  public markRequestSuccess(): void {
    if (this.apiKeys.length === 0) return;
    const currentCount = (this.requestCounts[this.currentKeyIndex] || 0) + 1;
    this.requestCounts[this.currentKeyIndex] = currentCount;
    this.storeRequestCount(this.currentKeyIndex, currentCount);
    
    if (currentCount >= this.maxRequestsPerKey * 0.9) {
      console.log(`⚠️ API Key ${this.currentKeyIndex + 1} approaching limit, switching...`);
      try {
        this.getNextKey();
      } catch (error) {
        console.error(error);
      }
    }
  }
  
  public getStatus() {
    const now = new Date();
    const nextReset = new Date(this.lastResetTime.getTime() + (this.quotaResetHours * 60 * 60 * 1000));
    const hoursUntilReset = (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      currentKeyIndex: this.currentKeyIndex,
      totalKeys: this.apiKeys.length,
      activeKeys: this.apiKeys.length - this.failedKeys.size,
      requestCounts: this.requestCounts,
      failedKeys: Array.from(this.failedKeys),
      lastReset: this.lastResetTime,
      nextReset: nextReset,
      hoursUntilReset: Math.max(0, parseFloat(hoursUntilReset.toFixed(1))),
    };
  }

  public manualReset() {
    if (confirm('Are you sure you want to reset all API keys? This will clear all request counts.')) {
      this.resetAllKeys();
      return true;
    }
    return false;
  }
  
  public forceSwitchKey() {
    const oldKey = this.currentKeyIndex + 1;
    try {
      this.getNextKey();
      const newKey = this.currentKeyIndex + 1;
      console.log(`🔀 Manually switched from Key ${oldKey} to Key ${newKey}`);
    } catch (e) {
      alert("Could not switch key: All other keys have failed or exceeded their quota.");
    }
  }

  private resetAllKeys() {
    this.failedKeys.clear();
    this.storeFailedKeys();
    Object.keys(this.requestCounts).forEach(key => {
      const keyIndex = parseInt(key);
      this.requestCounts[keyIndex] = 0;
      this.storeRequestCount(keyIndex, 0);
    });
    this.currentKeyIndex = 0;
    this.storeCurrentKeyIndex();
    this.storeResetTime();
    console.log('🎯 All API keys reset! Fresh start...');
  }
}

const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;
