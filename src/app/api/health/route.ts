import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbPingStart = Date.now();
    await db.$queryRaw`SELECT 1;`;
    dbLatencyMs = Date.now() - dbPingStart;
  } catch {
    dbStatus = 'unhealthy';
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  const isHealthy = dbStatus === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        memory: {
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
        uptimeSeconds: Math.round(uptimeSeconds),
      },
    },
    { status: statusCode }
  );
}
