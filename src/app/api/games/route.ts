import { GameRepository } from '@/repositories/game.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const gameRepo = new GameRepository();

export async function GET() {
  try {
    const games = await gameRepo.findAll();
    return successResponse(games);
  } catch (error) {
    return handleApiError(error);
  }
}
