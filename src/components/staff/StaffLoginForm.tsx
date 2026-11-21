'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { AUTH_CONTROL_CLASS } from '@/components/auth/styles';
import { useDictionary } from '@/i18n/LocaleProvider';
import { ApiError } from '@/lib/errors';
import { getStaffAccess } from '@/lib/api/staff-products';

const buildSchema = (copy: { usernameRequired: string; passwordRequired: string }) =>
  z.object({
    username: z.string().min(1, copy.usernameRequired),
    password: z.string().min(1, copy.passwordRequired),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

/**
 * Staff sign-in. It uses the same auth endpoint as the shop, then asks
 * WordPress whether this account may open the dashboard — a customer account
 * that signs in here is told so instead of being let through.
 */
export function StaffLoginForm() {
  const router = useRouter();
  const copy = useDictionary().staff.login;
  const { login, logout, loading } = useAuthStore();
  const schema = useMemo(() => buildSchema(copy), [copy]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ username, password }: FormValues) => {
    setFormError(null);

    try {
      await login(username, password);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      setError('root', {
        message: code === 'invalid_credentials' ? copy.invalidCredentials : copy.failed,
      });
      return;
    }

    try {
      await getStaffAccess();
      router.replace('/studio/products');
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      await logout();
      setFormError(code === 'forbidden' ? copy.noAccess : copy.failed);
    }
  };

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="staff-username">{copy.usernameLabel}</Label>
        <Input
          id="staff-username"
          autoComplete="username"
          className={AUTH_CONTROL_CLASS}
          aria-invalid={Boolean(errors.username)}
          {...register('username')}
        />
        {errors.username && (
          <p role="alert" className="text-sm text-destructive">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff-password">{copy.passwordLabel}</Label>
        <Input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          className={AUTH_CONTROL_CLASS}
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && (
          <p role="alert" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {(formError || errors.root) && (
        <p role="alert" className="text-sm text-destructive">
          {formError ?? errors.root?.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            {copy.submitting}
          </>
        ) : (
          copy.submit
        )}
      </Button>
    </form>
  );
}
