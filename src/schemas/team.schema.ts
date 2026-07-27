import { z } from 'zod';
import { EntityStatus } from '@prisma/client';

export const CreateTeamSchema = z.object({
  gameId: z.string().uuid(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(150),
  logo: z.string().url().optional(),
  description: z.string().optional(),
  country: z.string().max(100).optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
});

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
