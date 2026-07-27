import { VoteRepositoryInterface } from '@/repositories/vote.repository';
import { PlayerRepositoryInterface } from '@/repositories/player.repository';
import { AppError } from '@/utils/error-handler';
import { VoteSource } from '@prisma/client';
import crypto from 'crypto';

export interface CastVoteDTO {
  playerId: string;
  userId?: string;
  clientIp: string;
  userAgent: string;
  deviceFingerprint: string;
  sessionToken: string;
  source: VoteSource;
}

export class VoteService {
  constructor(
    private voteRepo: VoteRepositoryInterface,
    private playerRepo: PlayerRepositoryInterface
  ) {}

  async castVote(dto: CastVoteDTO): Promise<{ success: boolean; totalVotes: number }> {
    // 1. Verify Player Existence & Active Status
    const player = await this.playerRepo.findById(dto.playerId);
    if (!player || player.status !== 'ACTIVE') {
      throw new AppError('Player is not active or found', 404, 'PLAYER_NOT_FOUND');
    }

    // 2. Anti-Cheat Fingerprinting & Hashing
    const ipHash = this.hashString(dto.clientIp);
    const deviceHash = this.hashString(`${dto.deviceFingerprint}-${dto.userAgent}`);
    const sessionHash = this.hashString(dto.sessionToken);

    // 3. Rule A: Device Cooldown (Max 1 vote per player per 60 seconds per device)
    const hasVotedRecently = await this.voteRepo.findRecentVoteByDevice(dto.playerId, deviceHash, 60);
    if (hasVotedRecently) {
      throw new AppError('Cooldown active. Please wait 60 seconds before voting for this player again.', 429, 'VOTE_COOLDOWN');
    }

    // 4. Rule B: IP Rate Throttling (Max 10 votes per IP across player per 10 minutes)
    const ipVoteCount = await this.voteRepo.findRecentVoteByIp(dto.playerId, ipHash, 600);
    if (ipVoteCount >= 10) {
      throw new AppError('Too many votes from your network location.', 429, 'IP_THROTTLED');
    }

    // 5. Commit Immutable Vote Entry (Triggers atomic increment in DB)
    await this.voteRepo.create({
      playerId: player.id,
      teamId: player.teamId,
      gameId: player.gameId,
      userId: dto.userId ?? null,
      ipHash,
      deviceHash,
      sessionHash,
      source: dto.source,
    });

    const newTotal = await this.voteRepo.getPlayerVotesCount(player.id);
    return { success: true, totalVotes: newTotal };
  }

  async getPlayerVoteHistory(playerId: string) {
    const player = await this.playerRepo.findById(playerId);
    if (!player) {
      throw new AppError('Player not found', 404, 'PLAYER_NOT_FOUND');
    }
    return this.voteRepo.getPlayerVotesHistory(playerId);
  }

  private hashString(input: string): string {
    const pepper = process.env.SECURITY_HASH_PEPPER || 'voteplay-secure-pepper';
    return crypto.createHash('sha256').update(`${input}-${pepper}`).digest('hex');
  }
}
