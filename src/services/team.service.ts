import { TeamRepositoryInterface } from '@/repositories/team.repository';
import { CreateTeamInput } from '@/schemas/team.schema';
import { AppError } from '@/utils/error-handler';

export class TeamService {
  constructor(private teamRepo: TeamRepositoryInterface) {}

  async getAllTeams(gameId?: string) {
    return this.teamRepo.findAll(gameId);
  }

  async getTeamBySlug(slug: string) {
    const teamSlug = slug;
    const team = await this.teamRepo.findBySlug(teamSlug);
    if (!team) {
      throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
    }
    return team;
  }

  async createTeam(data: CreateTeamInput) {
    const teamSlug = data.slug;
    const existing = await this.teamRepo.findBySlug(teamSlug);
    if (existing) {
      throw new AppError('Team slug already exists', 400, 'SLUG_DUPLICATE');
    }
    return this.teamRepo.create(data);
  }
}
