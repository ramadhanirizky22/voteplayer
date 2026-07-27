import { db } from '@/lib/db';
import { LeaderboardQueryInput } from '@/schemas/leaderboard.schema';
import { LeaderboardItem } from '@/types';

export class LeaderboardService {
  private static isViewVerified = false;

  private async ensureViewExists() {
    if (LeaderboardService.isViewVerified) return;

    try {
      const createViewSql = `
        CREATE OR REPLACE VIEW v_leaderboard_detail AS
        SELECT 
            p.id AS player_id,
            p.nickname,
            p.full_name,
            p.avatar,
            p.role AS player_role,
            p.country AS player_country,
            t.id AS team_id,
            t.name AS team_name,
            t.slug AS team_slug,
            t.logo AS team_logo,
            g.id AS game_id,
            g.name AS game_name,
            g.slug AS game_slug,
            COALESCE(s.total_vote, 0) AS total_vote,
            COALESCE(s.daily_vote, 0) AS daily_vote,
            COALESCE(s.weekly_vote, 0) AS weekly_vote,
            COALESCE(s.monthly_vote, 0) AS monthly_vote,
            COALESCE(s.yearly_vote, 0) AS yearly_vote,
            COALESCE(s.updated_at, p.created_at) AS last_voted_at
        FROM players p
        JOIN teams t ON p.team_id = t.id
        JOIN games g ON p.game_id = g.id
        LEFT JOIN player_vote_summary s ON p.id = s.player_id
        WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE';
      `;
      await db.$executeRawUnsafe(createViewSql);
      LeaderboardService.isViewVerified = true;
    } catch (err) {
      console.error('[LEADERBOARD_VIEW_INIT_ERROR]:', err);
    }
  }

  async getLeaderboard(query: LeaderboardQueryInput): Promise<{
    items: LeaderboardItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.ensureViewExists();

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    let sortColumn = 'total_vote';
    if (query.period === 'daily') sortColumn = 'daily_vote';
    if (query.period === 'weekly') sortColumn = 'weekly_vote';
    if (query.period === 'monthly') sortColumn = 'monthly_vote';
    if (query.period === 'yearly') sortColumn = 'yearly_vote';

    const whereConditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.gameSlug) {
      whereConditions.push(`game_slug = $${paramIndex}`);
      params.push(query.gameSlug);
      paramIndex++;
    }

    if (query.teamSlug) {
      whereConditions.push(`team_slug = $${paramIndex}`);
      params.push(query.teamSlug);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int as total FROM v_leaderboard_detail ${whereClause}`;
    const countResult: Array<{ total: number }> = await db.$queryRawUnsafe(countSql, ...params);
    const total = countResult[0]?.total ?? 0;

    const dataSql = `
      SELECT 
        player_id as "playerId",
        nickname,
        full_name as "fullName",
        avatar,
        player_role as "playerRole",
        player_country as "playerCountry",
        team_id as "teamId",
        team_name as "teamName",
        team_slug as "teamSlug",
        team_logo as "teamLogo",
        game_id as "gameId",
        game_name as "gameName",
        game_slug as "gameSlug",
        total_vote::int as "totalVote",
        daily_vote::int as "dailyVote",
        weekly_vote::int as "weeklyVote",
        monthly_vote::int as "monthlyVote",
        yearly_vote::int as "yearlyVote",
        last_voted_at as "lastVotedAt"
      FROM v_leaderboard_detail
      ${whereClause}
      ORDER BY ${sortColumn} DESC, nickname ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const items: LeaderboardItem[] = await db.$queryRawUnsafe(dataSql, ...params, limit, offset);

    const rankedItems = items.map((item, idx) => ({
      ...item,
      rank: offset + idx + 1,
    }));

    return {
      items: rankedItems,
      total,
      page,
      limit,
    };
  }
}
