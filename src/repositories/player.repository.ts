import { db } from '@/lib/db';
import { Player, EntityStatus } from '@prisma/client';
import { CreatePlayerInput, UpdatePlayerInput } from '@/schemas/player.schema';

export interface PlayerWithRelations extends Player {
  team?: { id: string; name: string; slug: string; logo: string | null } | null;
  game?: { id: string; name: string; slug: string; logo: string | null } | null;
  voteSummary?: { totalVote: bigint } | null;
}

export interface PlayerRepositoryInterface {
  findAll(filters?: { gameId?: string; teamId?: string; query?: string }): Promise<PlayerWithRelations[]>;
  findById(id: string): Promise<(Player & { team: { name: string; slug: string }; game: { name: string; slug: string }; totalVotes: number }) | null>;
  create(data: CreatePlayerInput): Promise<Player>;
  update(id: string, data: Partial<UpdatePlayerInput>): Promise<Player>;
  softDelete(id: string): Promise<boolean>;
}

export class PlayerRepository implements PlayerRepositoryInterface {
  async findAll(filters?: { gameId?: string; teamId?: string; query?: string }): Promise<PlayerWithRelations[]> {
    return db.player.findMany({
      where: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
        ...(filters?.gameId ? { gameId: filters.gameId } : {}),
        ...(filters?.teamId ? { teamId: filters.teamId } : {}),
        ...(filters?.query
          ? {
              OR: [
                { nickname: { contains: filters.query, mode: 'insensitive' } },
                { fullName: { contains: filters.query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        team: { select: { id: true, name: true, slug: true, logo: true } },
        game: { select: { id: true, name: true, slug: true, logo: true } },
        voteSummary: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const player = await db.player.findFirst({
      where: { id, deletedAt: null },
      include: {
        team: { select: { id: true, name: true, slug: true, logo: true } },
        game: { select: { id: true, name: true, slug: true, logo: true } },
        voteSummary: true,
      },
    });

    if (!player) return null;

    return {
      ...player,
      totalVotes: Number(player.voteSummary?.totalVote ?? 0),
    };
  }

  async create(data: CreatePlayerInput): Promise<Player> {
    return db.player.create({ data });
  }

  async update(id: string, data: Partial<UpdatePlayerInput>): Promise<Player> {
    const { id: _, ...updateData } = data;
    return db.player.update({
      where: { id },
      data: updateData,
    });
  }

  async softDelete(id: string): Promise<boolean> {
    await db.player.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
