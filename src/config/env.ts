import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
  DIRECT_URL: z.string().optional(),
  API_SECRET_KEY: z.string().min(32, 'API_SECRET_KEY minimal 32 karakter'),
  REDIS_URL: z.string().min(1, 'REDIS_URL wajib diisi'),
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
      // eslint-disable-next-line no-console
      console.error('❌ Invalid Environment Variables:', parsed.error.flatten().fieldErrors);
      throw new Error('Konfigurasi environment variable tidak valid. Aplikasi dihentikan.');
    }
    return parsed.data;
  }

  const parsed = clientSchema.safeParse(processEnv);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid Environment Variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Konfigurasi environment variable tidak valid. Aplikasi dihentikan.');
  }

  return parsed.data as Env;
}

export const env = validateEnv();


