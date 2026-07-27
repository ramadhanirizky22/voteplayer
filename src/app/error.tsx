'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[PAGE_ERROR_LOG]:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950 text-slate-100 min-h-screen">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
        ⚠️
      </div>
      <h2 className="text-2xl font-bold text-white">Terjadi Kesalahan System</h2>
      <p className="text-xs text-slate-400 max-w-md">
        {error?.message || 'Maaf, sistem mengalami kendala yang tidak terduga.'}
      </p>
      <Button onClick={() => reset()}>Coba Lagi</Button>
    </div>
  );
}
