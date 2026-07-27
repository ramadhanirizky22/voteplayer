'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to tracking service (Sentry/Pino)
    // eslint-disable-next-line no-console
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <h2 className="text-2xl font-bold">Terjadi Kesalahan System</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Maaf, sistem mengalami kendala yang tidak terduga.
      </p>
      <Button onClick={() => reset()}>Coba Lagi</Button>
    </div>
  );
}
