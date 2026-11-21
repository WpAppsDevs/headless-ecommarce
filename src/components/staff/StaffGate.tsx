'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';
import { getStaffAccess } from '@/lib/api/staff-products';
import { ApiError } from '@/lib/errors';
import { StaffShell } from '@/components/staff/StaffShell';

type GateState = 'checking' | 'allowed' | 'denied' | 'failed';

/**
 * The dashboard's door.
 *
 * It waits for the session to hydrate, sends a signed-out visitor to the staff
 * sign-in, then asks WordPress whether this token holds the staff capability.
 * The answer is never cached in the browser beyond this mount: a token that
 * loses the role loses the dashboard on the next load.
 */
export function StaffGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const copy = useDictionary().staff;
  const { hydrated, isAuthenticated } = useAuthStore();
  const [state, setState] = useState<GateState>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/studio/login');
      return;
    }

    let cancelled = false;

    getStaffAccess()
      .then(() => {
        if (!cancelled) setState('allowed');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const code = error instanceof ApiError ? error.code : '';
        setState(code === 'forbidden' || code === 'no_token' ? 'denied' : 'failed');
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, router, attempt]);

  const handleRetry = () => {
    setState('checking');
    setAttempt((n) => n + 1);
  };

  if (!hydrated || state === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-brand-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {copy.loading}
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-brand-text-muted opacity-60" aria-hidden="true" />
        <h1 className="text-xl font-semibold">{copy.noAccessTitle}</h1>
        <p className="text-sm text-brand-text-muted">{copy.noAccessBody}</p>
        <Button type="button" variant="outline" onClick={handleRetry}>
          {copy.retry}
        </Button>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-brand-text-muted">{copy.errorBody}</p>
        <Button type="button" variant="outline" onClick={handleRetry}>
          {copy.retry}
        </Button>
      </div>
    );
  }

  return <StaffShell>{children}</StaffShell>;
}
