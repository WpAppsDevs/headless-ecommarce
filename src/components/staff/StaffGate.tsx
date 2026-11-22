'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';
import { getStaffAccess, type StaffAccess } from '@/lib/api/staff-products';
import { staffAccessOutcome } from '@/lib/staff-access-outcome';
import { ApiError } from '@/lib/errors';
import { isStaff } from '@/lib/roles';
import { StudioShell } from '@/components/staff/StudioShell';

type GateState = 'checking' | 'allowed' | 'denied' | 'unavailable';

const StaffAccessContext = createContext<StaffAccess | null>(null);

/**
 * The capability flags WordPress returned for this session.
 *
 * Null outside the gate. A component uses it to decide what to *show*; the
 * plugin still decides what may actually happen.
 */
export function useStaffAccess(): StaffAccess | null {
  return useContext(StaffAccessContext);
}

/**
 * The dashboard's door.
 *
 * The role in the profile decides whether this person belongs here at all —
 * WordPress sends `roles` with the login and refresh payloads, so no request is
 * needed to bounce a customer. Only a staff profile then asks WordPress whether
 * the token really may use the dashboard, which is what catches a role removed
 * while the person is still signed in.
 *
 * Outcomes are distinct: an expired session goes back to `/login` with the
 * studio path as its landing; a live session without the role sees the
 * no-access screen, never a login form that would let them in again.
 */
export function StaffGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = useDictionary().staff;
  const { hydrated, isAuthenticated, user, profile, logout } = useAuthStore();
  const roles = profile?.roles ?? user?.roles ?? [];
  const staff = isStaff(roles);
  const [state, setState] = useState<GateState>('checking');
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [attempt, setAttempt] = useState(0);

  const studioPath = searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(studioPath)}`);
      return;
    }

    if (!staff) return;

    let cancelled = false;

    getStaffAccess()
      .then((next) => {
        if (cancelled) return;
        setAccess(next);
        setState('allowed');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const code = error instanceof ApiError ? error.code : '';
        const outcome = staffAccessOutcome(code);
        if (outcome === 'expired') {
          void logout().then(() => {
            router.replace(`/login?redirect=${encodeURIComponent(studioPath)}`);
          });
          return;
        }
        setState(outcome === 'denied' ? 'denied' : 'unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, staff, router, attempt, studioPath, logout]);

  const handleRetry = () => {
    setState('checking');
    setAttempt((n) => n + 1);
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  if (hydrated && isAuthenticated && !staff) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-brand-text-muted opacity-60" aria-hidden="true" />
        <h1 className="text-xl font-semibold">{copy.noAccessTitle}</h1>
        <p className="text-sm text-brand-text-muted">{copy.noAccessBody}</p>
        <Button type="button" variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          {copy.signOut}
        </Button>
      </div>
    );
  }

  if (!hydrated || state === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-brand-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {copy.loading}
      </div>
    );
  }

  if (state === 'unavailable') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-brand-text-muted">{copy.unavailableBody}</p>
        <Button type="button" variant="outline" onClick={handleRetry}>
          {copy.retry}
        </Button>
      </div>
    );
  }

  return (
    <StaffAccessContext.Provider value={access}>
      <StudioShell>{children}</StudioShell>
    </StaffAccessContext.Provider>
  );
}
