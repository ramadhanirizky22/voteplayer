import { describe, it, expect } from 'vitest';
import { validateEnv } from '../env';

describe('validateEnv', () => {
  it('harus berhasil memvalidasi ketika environment variables valid', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.API_SECRET_KEY = '01234567890123456789012345678901';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    const originalWindow = global.window;
    // @ts-expect-error Mocking global window deletion for test
    delete global.window;

    const validated = validateEnv();
    expect(validated.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');

    global.window = originalWindow;
  });

  it('harus melemparkan error jika environment variables server tidak valid', () => {
    const originalDbUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    const originalWindow = global.window;
    // @ts-expect-error Mocking global window deletion for test
    delete global.window;

    expect(() => validateEnv()).toThrow('Konfigurasi environment variable tidak valid');

    process.env.DATABASE_URL = originalDbUrl;
    global.window = originalWindow;
  });
});


