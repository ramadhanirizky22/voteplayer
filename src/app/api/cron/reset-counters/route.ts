import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, successResponse } from '@/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization check via CRON_SECRET bearer token
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'voteplay-secret-cron-key';

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid cron authorization token' },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // 'daily' | 'weekly' | 'monthly' | 'yearly'

    if (!period || !['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid period parameter' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 2. Invoke Stored Procedure
    await db.$executeRawUnsafe(`CALL reset_periodic_vote_counters('${period}');`);

    return successResponse({
      message: `Periodic vote counter successfully reset for period: ${period}`,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
