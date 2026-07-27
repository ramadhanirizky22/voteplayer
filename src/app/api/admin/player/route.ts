import { NextRequest } from 'next/server';
import { CreatePlayerSchema, UpdatePlayerSchema } from '@/schemas/player.schema';
import { PlayerService } from '@/services/player.service';
import { PlayerRepository } from '@/repositories/player.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const playerService = new PlayerService(new PlayerRepository());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreatePlayerSchema.parse(body);
    const newPlayer = await playerService.createPlayer(validated);
    return successResponse(newPlayer, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = UpdatePlayerSchema.parse(body);
    const updatedPlayer = await playerService.updatePlayer(validated);
    return successResponse(updatedPlayer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return handleApiError(new Error('Player ID parameter is required'));
    }

    await playerService.deletePlayer(id);
    return successResponse({ message: 'Player successfully soft deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
