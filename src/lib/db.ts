import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Helper to format database connection string for serverless environments (Vercel)
function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;

  // Ensure sslmode=require and pgbouncer params exist if connecting to Supabase
  if (url.includes('supabase.co') || url.includes('pooler.supabase.com')) {
    if (!url.includes('sslmode=')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}sslmode=require&connect_timeout=15`;
    }
  }
  return url;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatasourceUrl(),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
