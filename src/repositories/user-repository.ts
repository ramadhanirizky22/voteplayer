import { db } from '@/lib/db';
import type { User, Role } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name?: string;
  password: string;
  role?: Role;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return db.user.create({
      data,
    });
  }
}
