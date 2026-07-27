import { describe, it, expect, vi } from 'vitest';
import { LeaderboardService } from '@/services/leaderboard.service';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    $queryRawUnsafe: vi.fn(),
  },
}));

describe('LeaderboardService Unit Tests', () => {
  const leaderboardService = new LeaderboardService();

  const mockLeaderboardItems = [
    {
      playerId: 'p1',
      nickname: 'f0rsakeN',
      fullName: 'Jason Susanto',
      avatar: 'https://cdn.nevacloud.io/avatars/forsaken.webp',
      playerRole: 'Duelist',
      playerCountry: 'Indonesia',
      teamId: 't1',
      teamName: 'Paper Rex',
      teamSlug: 'paper-rex',
      teamLogo: null,
      gameId: 'g1',
      gameName: 'VALORANT',
      gameSlug: 'valorant',
      totalVote: 3400,
      dailyVote: 180,
      weeklyVote: 920,
      monthlyVote: 2300,
      yearlyVote: 3400,
      lastVotedAt: new Date(),
    },
    {
      playerId: 'p2',
      nickname: 'Alberttt',
      fullName: 'Albert Neilsen',
      avatar: 'https://cdn.nevacloud.io/avatars/alberttt.webp',
      playerRole: 'Jungler',
      playerCountry: 'Indonesia',
      teamId: 't2',
      teamName: 'ONIC',
      teamSlug: 'onic',
      teamLogo: null,
      gameId: 'g2',
      gameName: 'MLBB',
      gameSlug: 'mobile-legends',
      totalVote: 2100,
      dailyVote: 110,
      weeklyVote: 650,
      monthlyVote: 1450,
      yearlyVote: 2100,
      lastVotedAt: new Date(),
    },
  ];

  it('should calculate leaderboard rankings with correct page & limit offsets', async () => {
    vi.mocked(db.$queryRawUnsafe)
      .mockResolvedValueOnce([{ total: 2 }]) // count query
      .mockResolvedValueOnce(mockLeaderboardItems); // data query

    const result = await leaderboardService.getLeaderboard({
      period: 'all_time',
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(2);
    expect(result.items.length).toBe(2);
    expect(result.items[0]!.rank).toBe(1);
    expect(result.items[1]!.rank).toBe(2);
    expect(result.items[0]!.nickname).toBe('f0rsakeN');
  });

  it('should filter leaderboard by gameSlug when provided', async () => {
    vi.mocked(db.$queryRawUnsafe)
      .mockResolvedValueOnce([{ total: 1 }])
      .mockResolvedValueOnce([mockLeaderboardItems[0]]);

    const result = await leaderboardService.getLeaderboard({
      gameSlug: 'valorant',
      period: 'daily',
      page: 1,
      limit: 5,
    });

    expect(result.total).toBe(1);
    expect(result.items[0]!.gameSlug).toBe('valorant');
  });
});
