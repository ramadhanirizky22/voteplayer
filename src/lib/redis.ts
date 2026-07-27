/**
 * Redis & Cache Utility Driver
 * Used for high-frequency sliding window rate limiting and leaderboard cache invalidation.
 */

export class CacheDriver {
  private inMemoryStore = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.inMemoryStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.inMemoryStore.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.inMemoryStore.delete(key);
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    const current = await this.get<number>(key);
    const count = (current ?? 0) + 1;
    await this.set(key, count, ttlSeconds);
    return count;
  }
}

export const cacheDriver = new CacheDriver();
