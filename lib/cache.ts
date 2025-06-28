interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxRetries: number;
  baseRetryDelay: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private retryAttempts = new Map<string, number>();
  private lastRateLimitTime = 0;
  
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    baseRetryDelay: 1000
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Load cache from sessionStorage on initialization
    this.loadFromStorage();
  }

  private getStorageKey(key: string): string {
    return `nyra_cache_${key}`;
  }

  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        return;
      }
      
      const keys = Object.keys(sessionStorage);
      for (const storageKey of keys) {
        if (storageKey.startsWith('nyra_cache_')) {
          const cacheKey = storageKey.replace('nyra_cache_', '');
          const stored = sessionStorage.getItem(storageKey);
          if (stored) {
            const entry: CacheEntry<any> = JSON.parse(stored);
            // Only load if not expired
            if (entry.expiry > Date.now()) {
              this.cache.set(cacheKey, entry);
            } else {
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem(storageKey);
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(key: string, entry: CacheEntry<any>): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        return;
      }
      sessionStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private isRateLimited(): boolean {
    // Don't make requests for 60 seconds after a rate limit
    return Date.now() - this.lastRateLimitTime < 60000;
  }

  private handleRateLimit(): void {
    this.lastRateLimitTime = Date.now();
    console.warn('Rate limited detected. Pausing requests for 60 seconds.');
  }

  private getRetryDelay(key: string): number {
    const attempts = this.retryAttempts.get(key) || 0;
    return this.config.baseRetryDelay * Math.pow(2, attempts); // Exponential backoff
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expiry <= Date.now()) {
      this.cache.delete(key);
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.getStorageKey(key));
      }
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.defaultTTL);
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), expiry };
    
    this.cache.set(key, entry);
    this.saveToStorage(key, entry);
    
    // Reset retry attempts on successful set
    this.retryAttempts.delete(key);
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
    forceRefresh = false
  ): Promise<T> {
    // Check rate limiting
    if (this.isRateLimited() && !forceRefresh) {
      const cached = this.get<T>(key);
      if (cached) {
        return cached;
      }
      throw new Error('Rate limited. Please wait a moment and try again.');
    }

    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached) {
        return cached;
      }
    }

    // Check if there's already a pending request for this key
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create new request
    const requestPromise = this.executeWithRetry(key, fetchFn, ttl);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async executeWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const attempts = this.retryAttempts.get(key) || 0;

    try {
      const result = await fetchFn();
      this.set(key, result, ttl);
      return result;
    } catch (error: any) {
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        this.handleRateLimit();
        const cached = this.get<T>(key);
        if (cached) {
          return cached;
        }
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      // Retry logic for other errors
      if (attempts < this.config.maxRetries) {
        this.retryAttempts.set(key, attempts + 1);
        const delay = this.getRetryDelay(key);
        
        console.warn(`Request failed for ${key}, retrying in ${delay}ms (attempt ${attempts + 1}/${this.config.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(key, fetchFn, ttl);
      }

      // Max retries exceeded, try to return cached data
      const cached = this.get<T>(key);
      if (cached) {
        console.warn(`Request failed for ${key}, returning cached data`);
        return cached;
      }

      throw error;
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.getStorageKey(key));
    }
    this.retryAttempts.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.retryAttempts.clear();
    
    // Clear from sessionStorage - only if in browser environment
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const keys = Object.keys(sessionStorage);
      for (const key of keys) {
        if (key.startsWith('nyra_cache_')) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      retryAttempts: Array.from(this.retryAttempts.entries()),
      rateLimited: this.isRateLimited()
    };
  }
}

// Create singleton instance
export const apiCache = new ApiCache({
  defaultTTL: 3 * 60 * 1000, // 3 minutes for most data
  maxRetries: 2,
  baseRetryDelay: 2000
});

// Specialized cache instances for different data types
export const dashboardCache = new ApiCache({
  defaultTTL: 2 * 60 * 1000, // 2 minutes for dashboard data
  maxRetries: 2,
  baseRetryDelay: 1500
});

export const walletCache = new ApiCache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for wallet data (changes less frequently)
  maxRetries: 2,
  baseRetryDelay: 2000
});

export const transactionCache = new ApiCache({
  defaultTTL: 1 * 60 * 1000, // 1 minute for transactions (more dynamic)
  maxRetries: 2,
  baseRetryDelay: 1000
}); 