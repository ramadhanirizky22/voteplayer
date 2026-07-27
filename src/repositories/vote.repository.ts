import { db } from '@/lib/db';
import { VoteSource } from '@prisma/client';

export interface CreateVoteParams {
  playerId: string;
  teamId: string;
  gameId: string;
  userId?: string | null;
  ipHash: string;
  deviceHash: string;
  sessionHash: string;
  source: VoteSource;
}

export interface VoteRepositoryInterface {
  create(data: CreateVoteParams): Promise<boolean>;
  findRecentVoteByDevice(playerId: string, deviceHash: string, windowSeconds: number): Promise<boolean>;
  findRecentVoteByIp(playerId: string, ipHash: string, windowSeconds: number): Promise<number>;
  getPlayerVotesCount(playerId: string): Promise<number>;
  getPlayerVotesHistory(playerId: string, limit?: number): Promise<Array<{ id: string; createdAt: Date; source: string }>>;
}

export class VoteRepository implements VoteRepositoryInterface {
  async create(data: CreateVoteParams): Promise<boolean> {
    const query = `
      INSERT INTO votes (player_id, team_id, game_id, user_id, ip_hash, device_hash, session_hash, source)
      VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, $8::vote_source)
    `;
    await db.$executeRawUnsafe(
      query,
      data.playerId,
      data.teamId,
      data.gameId,
      data.userId ?? null,
      data.ipHash,
      data.deviceHash,
      data.sessionHash,
      data.source
    );
    return true;
  }

  async findRecentVoteByDevice(playerId: string, deviceHash: string, windowSeconds: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM votes 
      WHERE player_id = $1::uuid AND device_hash = $2 
        AND created_at >= NOW() - INTERVAL '1 second' * $3
      LIMIT 1;
    `;
    const result: Array<{ id: string }> = await db.$queryRawUnsafe(query, playerId, deviceHash, windowSeconds);
    return result.length > 0;
  }

  async findRecentVoteByIp(playerId: string, ipHash: string, windowSeconds: number): Promise<number> {
    const query = `
      SELECT COUNT(*)::int as count FROM votes 
      WHERE player_id = $1::uuid AND ip_hash = $2 
        AND created_at >= NOW() - INTERVAL '1 second' * $3;
    `;
    const result: Array<{ count: number }> = await db.$queryRawUnsafe(query, playerId, ipHash, windowSeconds);
    return result[0]?.count ?? 0;
  }

  async getPlayerVotesCount(playerId: string): Promise<number> {
    const summary = await db.playerVoteSummary.findUnique({
      where: { playerId },
      select: { totalVote: true },
    });
    return Number(summary?.totalVote ?? 0);
  }

  async getPlayerVotesHistory(playerId: string, limit = 50) {
    const query = `
      SELECT id, created_at as "createdAt", source 
      FROM votes 
      WHERE player_id = $1::uuid 
      ORDER BY created_at DESC 
      LIMIT $2;
    `;
    const result: Array<{ id: string; createdAt: Date; source: string }> = await db.$queryRawUnsafe(
      query,
      playerId,
      limit
    );
    return result;
  }
}
