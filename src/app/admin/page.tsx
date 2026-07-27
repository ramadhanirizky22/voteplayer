/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { GameRepository } from '@/repositories/game.repository';
import { TeamRepository } from '@/repositories/team.repository';
import { PlayerRepository } from '@/repositories/player.repository';
import { StatisticsService } from '@/services/statistics.service';
import { LeaderboardService } from '@/services/leaderboard.service';
import { safeSerialize } from '@/utils/json-serializer';
import AdminDashboardClient from './admin-dashboard-client';

export const revalidate = 0;

const gameRepo = new GameRepository();
const teamRepo = new TeamRepository();
const playerRepo = new PlayerRepository();
const statsService = new StatisticsService();
const leaderboardService = new LeaderboardService();

export default async function AdminPage() {
  let stats: Record<string, unknown> = {
    totalGames: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalVotes: 0,
    popularPlayer: null,
  };
  let games: unknown[] = [];
  let teams: unknown[] = [];
  let players: unknown[] = [];
  let leaderboardItems: unknown[] = [];

  try {
    const [statsRes, gamesRes, teamsRes, rawPlayers, leaderboardResult] = await Promise.all([
      statsService.getSystemStatistics(),
      gameRepo.findAll(),
      teamRepo.findAll(),
      playerRepo.findAll(),
      leaderboardService.getLeaderboard({ period: 'all_time', limit: 20, page: 1 }),
    ]);

    stats = statsRes as unknown as Record<string, unknown>;
    games = gamesRes;
    teams = teamsRes;
    players = rawPlayers.map((p) => ({
      ...p,
      totalVotes: Number(p.voteSummary?.totalVote ?? 0),
    }));
    leaderboardItems = leaderboardResult.items;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ADMIN_PAGE_FETCH_ERROR]:', err);
  }

  return (
    <AdminDashboardClient
      stats={safeSerialize(stats) as any}
      games={safeSerialize(games) as any}
      teams={safeSerialize(teams) as any}
      players={safeSerialize(players) as any}
      leaderboard={safeSerialize(leaderboardItems) as any}
    />
  );
}
