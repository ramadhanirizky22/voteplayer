import { db } from '@/lib/db';
import { Game, EntityStatus } from '@prisma/client';
import { CreateGameInput } from '@/schemas/game.schema';

export interface GameRepositoryInterface {
  findAll(): Promise<Game[]>;
  findBySlug(slug: string): Promise<Game | null>;
  findById(id: string): Promise<Game | null>;
  create(data: CreateGameInput): Promise<Game>;
  update(id: string, data: Partial<CreateGameInput>): Promise<Game>;
  softDelete(id: string): Promise<boolean>;
}

export class GameRepository implements GameRepositoryInterface {
  async findAll(): Promise<Game[]> {
    return db.game.findMany({
      where: { deletedAt: null, status: EntityStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string): Promise<Game | null> {
    return db.game.findFirst({
      where: { slug, deletedAt: null },
    });
  }

  async findById(id: string): Promise<Game | null> {
    return db.game.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: CreateGameInput): Promise<Game> {
    return db.game.create({ data });
  }

  async update(id: string, data: Partial<CreateGameInput>): Promise<Game> {
    return db.game.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<boolean> {
    await db.game.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
