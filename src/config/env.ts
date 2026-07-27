import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/voteplay'),
  DIRECT_URL: z.string().optional(),
  API_SECRET_KEY: z.string().default('01234567890123456789012345678901'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

const combinedSchema = serverSchema.merge(clientSchema);

export type Env = z.infer<typeof combinedSchema>;

export function validateEnv(): Env {
  const isServer = typeof window === 'undefined';

  const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  };

  if (isServer) {
    const parsed = combinedSchema.safeParse(processEnv);
    if (!parsed.success) {
      /* eslint-disable-next-line no-console */
      console.warn('⚠️ Environment Variable Warnings:', parsed.error.flatten().fieldErrors);
    }
    return (parsed.success ? parsed.data : processEnv) as Env;
  }

  const parsed = clientSchema.safeParse(processEnv);
  return (parsed.success ? parsed.data : processEnv) as Env;
}

export const env = validateEnv();
