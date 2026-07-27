import { NextRequest } from 'next/server';
import { VoteService } from '@/services/vote.service';
import { VoteRepository } from '@/repositories/vote.repository';
import { PlayerRepository } from '@/repositories/player.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const voteService = new VoteService(new VoteRepository(), new PlayerRepository());

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const votes = await voteService.getPlayerVoteHistory(params.id);
    return successResponse(votes);
  } catch (error) {
    return handleApiError(error);
  }
}
