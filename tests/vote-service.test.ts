import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VoteService } from '@/services/vote.service';
import { VoteRepositoryInterface } from '@/repositories/vote.repository';
import { PlayerRepositoryInterface } from '@/repositories/player.repository';
import { AppError } from '@/utils/error-handler';

describe('VoteService Anti-Cheat Tests', () => {
  let voteService: VoteService;
  let mockVoteRepo: VoteRepositoryInterface;
  let mockPlayerRepo: PlayerRepositoryInterface;

  const mockPlayer = {
    id: '11111111-1111-1111-1111-111111111111',
    teamId: '22222222-2222-2222-2222-222222222222',
    gameId: '33333333-3333-3333-3333-333333333333',
    nickname: 'Kiboy',
    fullName: 'Nicky Fernando',
    avatar: null,
    role: 'Roamer',
    country: 'Indonesia',
    biography: null,
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    team: { name: 'ONIC', slug: 'onic' },
    game: { name: 'MLBB', slug: 'mlbb' },
    totalVotes: 100,
  };

  beforeEach(() => {
    mockPlayerRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockPlayer),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };

    mockVoteRepo = {
      create: vi.fn().mockResolvedValue(true),
      findRecentVoteByDevice: vi.fn().mockResolvedValue(false),
      findRecentVoteByIp: vi.fn().mockResolvedValue(0),
      getPlayerVotesCount: vi.fn().mockResolvedValue(101),
      getPlayerVotesHistory: vi.fn().mockResolvedValue([]),
    };

    voteService = new VoteService(mockVoteRepo, mockPlayerRepo);
  });

  it('should successfully cast a vote when fingerprint is valid and not on cooldown', async () => {
    const result = await voteService.castVote({
      playerId: mockPlayer.id,
      clientIp: '192.168.1.1',
      userAgent: 'Mozilla/5.0 TestBrowser',
      deviceFingerprint: 'device_fp_hash_123456789',
      sessionToken: 'session_token_1234567890',
      source: 'WEB',
    });

    expect(result.success).toBe(true);
    expect(result.totalVotes).toBe(101);
    expect(mockVoteRepo.create).toHaveBeenCalledOnce();
  });

  it('should reject vote if player is not found or inactive', async () => {
    vi.mocked(mockPlayerRepo.findById).mockResolvedValueOnce(null);

    await expect(
      voteService.castVote({
        playerId: 'non-existent-id',
        clientIp: '192.168.1.1',
        userAgent: 'TestBrowser',
        deviceFingerprint: 'device_fp_hash_123456789',
        sessionToken: 'session_token_1234567890',
        source: 'WEB',
      })
    ).rejects.toThrow(AppError);
  });

  it('should reject vote if device cooldown is active (< 60 seconds)', async () => {
    vi.mocked(mockVoteRepo.findRecentVoteByDevice).mockResolvedValueOnce(true);

    await expect(
      voteService.castVote({
        playerId: mockPlayer.id,
        clientIp: '192.168.1.1',
        userAgent: 'TestBrowser',
        deviceFingerprint: 'device_fp_hash_123456789',
        sessionToken: 'session_token_1234567890',
        source: 'WEB',
      })
    ).rejects.toThrow('Cooldown active');
  });

  it('should reject vote if IP address is throttled (> 10 votes / 10 mins)', async () => {
    vi.mocked(mockVoteRepo.findRecentVoteByIp).mockResolvedValueOnce(10);

    await expect(
      voteService.castVote({
        playerId: mockPlayer.id,
        clientIp: '192.168.1.1',
        userAgent: 'TestBrowser',
        deviceFingerprint: 'device_fp_hash_123456789',
        sessionToken: 'session_token_1234567890',
        source: 'WEB',
      })
    ).rejects.toThrow('Too many votes from your network location');
  });
});
