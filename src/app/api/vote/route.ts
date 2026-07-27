import { NextRequest } from 'next/server';
import { CastVoteSchema } from '@/schemas/vote.schema';
import { VoteService } from '@/services/vote.service';
import { VoteRepository } from '@/repositories/vote.repository';
import { PlayerRepository } from '@/repositories/player.repository';
import { checkRateLimit } from '@/utils/rate-limiter';
import { applySecurityHeaders } from '@/utils/security-headers';
import { handleApiError, successResponse } from '@/utils/error-handler';

const voteService = new VoteService(new VoteRepository(), new PlayerRepository());

export async function POST(request: NextRequest) {
  try {
    // 1. Extract Client Metadata
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 2. Global IP Rate Limiter Check (Max 30 requests per minute per IP to voting endpoint)
    await checkRateLimit({
      key: `rate_limit_vote_ip:${clientIp}`,
      limit: 30,
      windowSeconds: 60,
    });

    // 3. Request Body Zod Validation
    const body = await request.json();
    const validated = CastVoteSchema.parse(body);

    // 4. Invoke Vote Service Business & Anti-Cheat Engine
    const result = await voteService.castVote({
      playerId: validated.playerId,
      clientIp,
      userAgent,
      deviceFingerprint: validated.deviceFingerprint,
      sessionToken: validated.sessionToken,
      source: validated.source,
    });

    const response = successResponse(result, undefined, 201);
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}
