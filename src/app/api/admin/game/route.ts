import { NextRequest } from 'next/server';
import { CreateGameSchema } from '@/schemas/game.schema';
import { GameRepository } from '@/repositories/game.repository';
import { AppError, handleApiError, successResponse } from '@/utils/error-handler';

const gameRepo = new GameRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateGameSchema.parse(body);

    const slug = validated.slug;
    const existing = await gameRepo.findBySlug(slug);
    if (existing) {
      throw new AppError('Game slug already exists', 400, 'SLUG_DUPLICATE');
    }

    const newGame = await gameRepo.create(validated);
    return successResponse(newGame, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
