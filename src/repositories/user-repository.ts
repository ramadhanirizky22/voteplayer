import { db } from '@/lib/db';
import type { Admin, AdminRole } from '@prisma/client';

export interface CreateAdminData {
  email: string;
  passwordHash: string;
  role?: AdminRole;
}

export class UserRepository {
  async findById(id: string): Promise<Admin | null> {
    return db.admin.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return db.admin.findUnique({
      where: { email },
    });
  }

  async create(data: CreateAdminData): Promise<Admin> {
    return db.admin.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'MODERATOR',
      },
    });
  }
}
