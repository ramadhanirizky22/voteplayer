import { cacheDriver } from '@/lib/redis';
import { AppError } from '@/utils/error-handler';

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<void> {
  const currentCount = await cacheDriver.increment(options.key, options.windowSeconds);
  if (currentCount > options.limit) {
    throw new AppError(
      `Rate limit exceeded. Please try again in a few moments.`,
      429,
      'TOO_MANY_REQUESTS'
    );
  }
}
