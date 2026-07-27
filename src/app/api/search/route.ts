import { NextRequest } from 'next/server';
import { PlayerRepository } from '@/repositories/player.repository';
import { TeamRepository } from '@/repositories/team.repository';
import { GameRepository } from '@/repositories/game.repository';
import { handleApiError, successResponse } from '@/utils/error-handler';

const playerRepo = new PlayerRepository();
const teamRepo = new TeamRepository();
const gameRepo = new GameRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length < 2) {
      return successResponse({ players: [], teams: [], games: [] });
    }

    const [players, teams, allGames] = await Promise.all([
      playerRepo.findAll({ query: q }),
      teamRepo.findAll(),
      gameRepo.findAll(),
    ]);

    const matchingTeams = teams.filter((t) =>
      t.name.toLowerCase().includes(q.toLowerCase())
    );
    const matchingGames = allGames.filter((g) =>
      g.name.toLowerCase().includes(q.toLowerCase())
    );

    return successResponse({
      players,
      teams: matchingTeams,
      games: matchingGames,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
