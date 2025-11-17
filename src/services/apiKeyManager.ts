'use server';

class ApiKeyManager {
  private apiKeys: string[];
  private currentKeyIndex: number;
  private failedKeys: Set<number>;
  private requestCounts: Record<number, number>;
  private maxRequestsPerKey: number;

  constructor() {
    this.apiKeys = [
      process.env.VITE_YOUTUBE_API_KEY_1,
      process.env.VITE_YOUTUBE_API_KEY_2,
      process.env.VITE_YOUTUBE_API_KEY_3,
      process.env.VITE_YOUTUBE_API_KEY_4,
      process.env.VITE_YOUTUBE_API_KEY_5,
    ]
      .filter((key): key is string => !!key && key !== 'YOUR_YOUTUBE_API_KEY_HERE')
      .filter(Boolean);

    this.currentKeyIndex = 0;
    this.failedKeys = new Set();
    this.requestCounts = {};
    
    this.apiKeys.forEach((_, index) => {
      this.requestCounts[index] = 0;
    });

    this.maxRequestsPerKey =
      parseInt(process.env.VITE_MAX_REQUESTS_PER_KEY || '9000', 10);

    if (this.apiKeys.length === 0) {
      console.warn('No valid YouTube API keys found in .env file.');
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

      if (
        !this.failedKeys.has(nextIndex) &&
        this.requestCounts[nextIndex] < this.maxRequestsPerKey
      ) {
        this.currentKeyIndex = nextIndex;
        console.log(`Switched to API Key ${this.currentKeyIndex + 1}`);
        return this.apiKeys[this.currentKeyIndex];
      }
    }

    throw new Error('All API keys quota exceeded or have failed.');
  }

  public markKeyFailed(keyIndex: number): void {
    if (!this.failedKeys.has(keyIndex)) {
        this.failedKeys.add(keyIndex);
        console.warn(`API Key ${keyIndex + 1} marked as failed or quota exceeded.`);
    }
  }

  public markRequestSuccess(): void {
    if (this.apiKeys.length === 0) return;

    this.requestCounts[this.currentKeyIndex]++;

    if (this.requestCounts[this.currentKeyIndex] >= this.maxRequestsPerKey * 0.9) {
      console.log(
        `API Key ${this.currentKeyIndex + 1} approaching limit, switching...`
      );
      try {
        this.getNextKey();
      } catch (error) {
        console.error(error);
      }
    }
  }

  public handleFailedRequest(error: any): void {
     if (this.apiKeys.length === 0) return;

    const currentIndex = this.currentKeyIndex;
    const isQuotaError =
      error?.message?.includes('quota') ||
      error?.message?.includes('exceeded') ||
      error?.status === 403;

    if (isQuotaError) {
      this.markKeyFailed(currentIndex);
    }

    try {
      this.getNextKey();
    } catch (e) {
      console.error('All API keys exhausted. No more keys to switch to.');
      // Re-throw or handle the complete exhaustion of keys
      throw new Error('All API keys are currently unavailable.');
    }
  }
}

const apiKeyManagerInstance = new ApiKeyManager();

const apiKeyManager = {
    getCurrentKey: async () => apiKeyManagerInstance.getCurrentKey(),
    markRequestSuccess: async () => apiKeyManagerInstance.markRequestSuccess(),
    handleFailedRequest: async (error: any) => apiKeyManagerInstance.handleFailedRequest(error),
};

export default apiKeyManager;
