'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { config } from '@/lib/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AUTH_CONTROL_CLASS } from '@/components/auth/styles';
import { useDictionary } from '@/i18n/LocaleProvider';

const buildSchema = (copy: { emailInvalid: string }) =>
  z.object({ email: z.string().email(copy.emailInvalid) });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function ForgotPasswordForm() {
  const copy = useDictionary().auth.forgot;
  const schema = useMemo(() => buildSchema(copy), [copy]);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await apiClient(`${config.apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
      });
    } catch {
      // Intentionally swallowed — anti-enumeration: always show success
    } finally {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
        {copy.sent}
      </div>
    );
  }

  return (
    // method="post" is a fallback: if Enter is pressed before hydration, a native
    // submit would otherwise put the password in the query string.
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">{copy.emailLabel}</Label>
        <Input
          className={AUTH_CONTROL_CLASS}
          id="email"
          type="email"
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className={`${AUTH_CONTROL_CLASS} w-full`} disabled={isSubmitting}>
        {isSubmitting ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
