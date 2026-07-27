import { NextRequest } from 'next/server';
import { LeaderboardQuerySchema } from '@/schemas/leaderboard.schema';
import { LeaderboardService } from '@/services/leaderboard.service';
import { handleApiError, successResponse } from '@/utils/error-handler';

const leaderboardService = new LeaderboardService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryInput = LeaderboardQuerySchema.parse({
      gameSlug: searchParams.get('gameSlug') ?? undefined,
      teamSlug: searchParams.get('teamSlug') ?? undefined,
      period: searchParams.get('period') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      page: searchParams.get('page') ?? undefined,
    });

    const result = await leaderboardService.getLeaderboard(queryInput);

    return successResponse(result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
