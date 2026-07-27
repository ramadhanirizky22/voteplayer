import { NextRequest } from 'next/server';
import { TeamService } from '@/services/team.service';
import { TeamRepository } from '@/repositories/team.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const teamService = new TeamService(new TeamRepository());

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const team = await teamService.getTeamBySlug(params.slug);
    return successResponse(team);
  } catch (error) {
    return handleApiError(error);
  }
}
