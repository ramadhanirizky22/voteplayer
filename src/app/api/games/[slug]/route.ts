import { NextRequest } from 'next/server';
import { GameRepository } from '@/repositories/game.repository';
import { AppError, handleApiError, successResponse } from '@/utils/error-handler';

const gameRepo = new GameRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const game = await gameRepo.findBySlug(params.slug);
    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }
    return successResponse(game);
  } catch (error) {
    return handleApiError(error);
  }
}
