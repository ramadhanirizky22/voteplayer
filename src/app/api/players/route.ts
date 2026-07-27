import { NextRequest } from 'next/server';
import { PlayerService } from '@/services/player.service';
import { PlayerRepository } from '@/repositories/player.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const playerService = new PlayerService(new PlayerRepository());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') ?? undefined;
    const teamId = searchParams.get('teamId') ?? undefined;
    const query = searchParams.get('query') ?? undefined;

    const players = await playerService.getAllPlayers({ gameId, teamId, query });
    return successResponse(players);
  } catch (error) {
    return handleApiError(error);
  }
}
