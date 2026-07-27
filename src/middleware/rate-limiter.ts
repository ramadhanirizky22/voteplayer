import { NextRequest, NextResponse } from 'next/server';
import { cacheDriver } from '@/lib/redis';

export async function edgeRateLimiterMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const key = `edge_limit:${clientIp}`;
  const current = await cacheDriver.increment(key, 60);

  if (current > 120) {
    return NextResponse.json(
      { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded at edge' } },
      { status: 429 }
    );
  }

  return null;
}
