import { z } from 'zod';

export const CastVoteSchema = z.object({
  playerId: z.string().uuid({ message: 'Invalid player UUID format' }),
  deviceFingerprint: z
    .string()
    .min(16, { message: 'Device fingerprint must be at least 16 characters' })
    .max(128),
  sessionToken: z
    .string()
    .min(16, { message: 'Session token must be at least 16 characters' })
    .max(128),
  source: z.enum(['WEB', 'MOBILE_WEB', 'IOS_APP', 'ANDROID_APP', 'PARTNER_API']).default('WEB'),
});

export type CastVoteInput = z.infer<typeof CastVoteSchema>;
