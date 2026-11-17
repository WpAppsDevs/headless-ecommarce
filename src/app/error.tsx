'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { reportError } from '@/lib/report-error';
import { useDictionary } from '@/i18n/LocaleProvider';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = useDictionary().common;

  useEffect(() => {
    reportError(error, { scope: 'app-error' });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 gap-6">
      <AlertTriangle className="h-16 w-16 text-destructive opacity-60" />
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{copy.errorTitle}</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">{copy.errorBody}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            {copy.errorId} {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          {copy.tryAgain}
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          {copy.backHome}
        </Link>
      </div>
    </div>
  );
}
