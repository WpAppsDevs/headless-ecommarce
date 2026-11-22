'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { resolveLanding } from '@/lib/login-redirect';
import { AUTH_CONTROL_CLASS } from '@/components/auth/styles';
import { useDictionary } from '@/i18n/LocaleProvider';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const buildSchema = (copy: { usernameRequired: string; passwordRequired: string }) =>
  z.object({
    username: z.string().min(1, copy.usernameRequired),
    password: z.string().min(1, copy.passwordRequired),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuthStore();
  const copy = useDictionary().auth.login;
  const schema = useMemo(() => buildSchema(copy), [copy]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ username, password }: FormValues) => {
    try {
      const guestToken =
        typeof window !== 'undefined'
          ? (localStorage.getItem('cart_token') ?? undefined)
          : undefined;

      await login(username, password, guestToken);

      const roles = useAuthStore.getState().user?.roles ?? [];
      router.push(resolveLanding({ roles, redirect: searchParams.get('redirect') }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : copy.failed;
      const friendly =
        msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credential')
          ? copy.invalidCredentials
          : msg;
      setError('root', { message: friendly });
    }
  };

  const resetSuccess = searchParams.get('reset') === 'success';

  return (
    // method="post" is a fallback: if Enter is pressed before hydration, a native
    // submit would otherwise put the password in the query string.
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Password reset success banner */}
      {resetSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {copy.resetSuccess}
        </div>
      )}

      {/* Root / API error */}
      {errors.root && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <Label htmlFor="username">{copy.usernameLabel}</Label>
        <Input
          className={AUTH_CONTROL_CLASS}
          id="username"
          type="text"
          autoComplete="username"
          aria-invalid={!!errors.username}
          {...register('username')}
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{copy.passwordLabel}</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {copy.forgotPassword}
          </Link>
        </div>
        <Input
          className={AUTH_CONTROL_CLASS}
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className={`${AUTH_CONTROL_CLASS} w-full`} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {copy.submitting}
          </>
        ) : (
          copy.submit
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {copy.noAccount}{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {copy.createAccount}
        </Link>
      </p>
    </form>
  );
}
