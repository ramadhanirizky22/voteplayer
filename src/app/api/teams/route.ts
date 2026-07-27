import { NextRequest } from 'next/server';
import { TeamRepository } from '@/repositories/team.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const teamRepo = new TeamRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') ?? undefined;

    const teams = await teamRepo.findAll(gameId);
    return successResponse(teams);
  } catch (error) {
    return handleApiError(error);
  }
}
