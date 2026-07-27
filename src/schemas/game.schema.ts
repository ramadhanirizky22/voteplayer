import { z } from 'zod';
import { EntityStatus } from '@prisma/client';

export const CreateGameSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lower-kebab-case'),
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  logo: z.string().url().optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
});

export type CreateGameInput = z.infer<typeof CreateGameSchema>;
