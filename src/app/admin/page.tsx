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
  const [stats, games, teams, rawPlayers, leaderboardResult] = await Promise.all([
    statsService.getSystemStatistics(),
    gameRepo.findAll(),
    teamRepo.findAll(),
    playerRepo.findAll(),
    leaderboardService.getLeaderboard({ period: 'all_time', limit: 20, page: 1 }),
  ]);

  const players = rawPlayers.map((p) => ({
    ...p,
    totalVotes: Number(p.voteSummary?.totalVote ?? 0),
  }));

  return (
    <AdminDashboardClient
      stats={safeSerialize(stats)}
      games={safeSerialize(games)}
      teams={safeSerialize(teams)}
      players={safeSerialize(players)}
      leaderboard={safeSerialize(leaderboardResult.items)}
    />
  );
}
