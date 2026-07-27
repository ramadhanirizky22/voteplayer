import { NextRequest } from 'next/server';
import { CreateTeamSchema } from '@/schemas/team.schema';
import { TeamService } from '@/services/team.service';
import { TeamRepository } from '@/repositories/team.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const teamService = new TeamService(new TeamRepository());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateTeamSchema.parse(body);
    const newTeam = await teamService.createTeam(validated);
    return successResponse(newTeam, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
