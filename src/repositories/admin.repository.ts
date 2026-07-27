import { db } from '@/lib/db';
import { Admin, EntityStatus } from '@prisma/client';

export interface AdminRepositoryInterface {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
}

export class AdminRepository implements AdminRepositoryInterface {
  async findByEmail(email: string): Promise<Admin | null> {
    return db.admin.findFirst({
      where: { email, status: EntityStatus.ACTIVE, deletedAt: null },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return db.admin.findFirst({
      where: { id, status: EntityStatus.ACTIVE, deletedAt: null },
    });
  }
}
