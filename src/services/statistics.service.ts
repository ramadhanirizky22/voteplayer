import { db } from '@/lib/db';
import { SystemStatistics } from '@/types';

export class StatisticsService {
  async getSystemStatistics(): Promise<SystemStatistics> {
    const totalGames = await db.game.count({ where: { deletedAt: null } });
    const totalTeams = await db.team.count({ where: { deletedAt: null } });
    const totalPlayers = await db.player.count({ where: { deletedAt: null } });

    const totalVotesResult: Array<{ sum: number }> = await db.$queryRaw`
      SELECT COALESCE(SUM(total_vote), 0)::int as sum FROM player_vote_summary;
    `;
    const todayVotesResult: Array<{ sum: number }> = await db.$queryRaw`
      SELECT COALESCE(SUM(daily_vote), 0)::int as sum FROM player_vote_summary;
    `;
    const weekVotesResult: Array<{ sum: number }> = await db.$queryRaw`
      SELECT COALESCE(SUM(weekly_vote), 0)::int as sum FROM player_vote_summary;
    `;
    const monthVotesResult: Array<{ sum: number }> = await db.$queryRaw`
      SELECT COALESCE(SUM(monthly_vote), 0)::int as sum FROM player_vote_summary;
    `;

    const topPlayerResult: Array<{ id: string; nickname: string; total_vote: number }> = await db.$queryRaw`
      SELECT p.id, p.nickname, s.total_vote::int
      FROM players p
      JOIN player_vote_summary s ON p.id = s.player_id
      WHERE p.deleted_at IS NULL
      ORDER BY s.total_vote DESC
      LIMIT 1;
    `;

    const topGameResult: Array<{ id: string; name: string; votes: number }> = await db.$queryRaw`
      SELECT g.id, g.name, COALESCE(SUM(s.total_vote), 0)::int as votes
      FROM games g
      JOIN players p ON p.game_id = g.id
      JOIN player_vote_summary s ON p.id = s.player_id
      WHERE g.deleted_at IS NULL
      GROUP BY g.id, g.name
      ORDER BY votes DESC
      LIMIT 1;
    `;

    const topTeamResult: Array<{ id: string; name: string; votes: number }> = await db.$queryRaw`
      SELECT t.id, t.name, COALESCE(SUM(s.total_vote), 0)::int as votes
      FROM teams t
      JOIN players p ON p.team_id = t.id
      JOIN player_vote_summary s ON p.id = s.player_id
      WHERE t.deleted_at IS NULL
      GROUP BY t.id, t.name
      ORDER BY votes DESC
      LIMIT 1;
    `;

    return {
      totalGames,
      totalTeams,
      totalPlayers,
      totalVotes: totalVotesResult[0]?.sum ?? 0,
      todayVotes: todayVotesResult[0]?.sum ?? 0,
      thisWeekVotes: weekVotesResult[0]?.sum ?? 0,
      thisMonthVotes: monthVotesResult[0]?.sum ?? 0,
      popularPlayer: topPlayerResult[0]
        ? { id: topPlayerResult[0].id, nickname: topPlayerResult[0].nickname, votes: topPlayerResult[0].total_vote }
        : null,
      popularGame: topGameResult[0] ? { id: topGameResult[0].id, name: topGameResult[0].name, votes: topGameResult[0].votes } : null,
      popularTeam: topTeamResult[0] ? { id: topTeamResult[0].id, name: topTeamResult[0].name, votes: topTeamResult[0].votes } : null,
    };
  }
}
