import { z } from 'zod';
import { EntityStatus } from '@prisma/client';

export const CreatePlayerSchema = z.object({
  gameId: z.string().uuid(),
  teamId: z.string().uuid(),
  nickname: z.string().min(2).max(100),
  fullName: z.string().max(150).optional(),
  avatar: z.string().url().optional(),
  role: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  biography: z.string().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
});

export const UpdatePlayerSchema = CreatePlayerSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreatePlayerInput = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof UpdatePlayerSchema>;
