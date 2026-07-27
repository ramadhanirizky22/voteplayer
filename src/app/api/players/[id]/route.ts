import { NextRequest } from 'next/server';
import { PlayerService } from '@/services/player.service';
import { PlayerRepository } from '@/repositories/player.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const playerService = new PlayerService(new PlayerRepository());

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const player = await playerService.getPlayerById(params.id);
    return successResponse(player);
  } catch (error) {
    return handleApiError(error);
  }
}
