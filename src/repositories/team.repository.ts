import { db } from '@/lib/db';
import { Team, EntityStatus } from '@prisma/client';
import { CreateTeamInput } from '@/schemas/team.schema';

export interface TeamRepositoryInterface {
  findAll(gameId?: string): Promise<Team[]>;
  findBySlug(slug: string): Promise<Team | null>;
  findById(id: string): Promise<Team | null>;
  create(data: CreateTeamInput): Promise<Team>;
  softDelete(id: string): Promise<boolean>;
}

export class TeamRepository implements TeamRepositoryInterface {
  async findAll(gameId?: string): Promise<Team[]> {
    return db.team.findMany({
      where: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
        ...(gameId ? { gameId } : {}),
      },
      include: {
        game: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string): Promise<Team | null> {
    return db.team.findFirst({
      where: { slug, deletedAt: null },
      include: {
        game: true,
        players: { where: { deletedAt: null } },
      },
    });
  }

  async findById(id: string): Promise<Team | null> {
    return db.team.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: CreateTeamInput): Promise<Team> {
    return db.team.create({ data });
  }

  async softDelete(id: string): Promise<boolean> {
    await db.team.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
