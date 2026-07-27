import { z } from 'zod';

export const LeaderboardQuerySchema = z.object({
  gameSlug: z.string().optional(),
  teamSlug: z.string().optional(),
  period: z.enum(['all_time', 'daily', 'weekly', 'monthly', 'yearly']).default('all_time'),
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
});

export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>;
