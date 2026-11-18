'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, KeyRound, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ApiError } from '@/lib/errors';
import { changePassword } from '@/lib/api/checkout';
import { useDictionary } from '@/i18n/LocaleProvider';

const INPUT_CLASS =
  'h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light';

/**
 * Password change, in the account rather than behind a reset email.
 *
 * The plugin verifies the current password, rehashes, and revokes every token
 * issued before the change; the proxy stores the replacement pair, so this
 * device stays signed in and the others are signed out.
 */
export function PasswordCard() {
  const copy = useDictionary().account.settings;
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z
    .object({
      current: z.string().min(1, copy.passwordRequired),
      next: z.string().min(8, copy.passwordTooShort),
      confirm: z.string().min(1, copy.passwordRequired),
    })
    .refine((values) => values.next !== values.current, {
      path: ['next'],
      message: copy.passwordSame,
    })
    .refine((values) => values.next === values.confirm, {
      path: ['confirm'],
      message: copy.passwordMismatch,
    });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current: '', next: '', confirm: '' },
  });

  const close = () => {
    setOpen(false);
    reset();
    setFormError(null);
  };

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await changePassword({ current_password: values.current, new_password: values.next });
      toast.success(copy.passwordSaved);
      close();
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : '';
      setFormError(
        code === 'invalid_password'
          ? copy.passwordWrongCurrent
          : code === 'weak_password'
            ? copy.passwordTooShort
            : code === 'same_password'
              ? copy.passwordSame
              : copy.saveFailed,
      );
    }
  };

  const fieldError = errors.current?.message ?? errors.next?.message ?? errors.confirm?.message;

  return (
    <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent-light text-brand-accent-strong"
        >
          <KeyRound className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-brand-text">{copy.passwordTitle}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-text-muted">
            {copy.passwordBody}
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
          >
            {copy.passwordChange}
          </button>
        )}
      </div>

      {open && (
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.currentPassword}</span>
              <input
                {...register('current')}
                type="password"
                autoComplete="current-password"
                className={INPUT_CLASS}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.newPassword}</span>
              <input
                {...register('next')}
                type="password"
                autoComplete="new-password"
                className={INPUT_CLASS}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.confirmPassword}</span>
              <input
                {...register('confirm')}
                type="password"
                autoComplete="new-password"
                className={INPUT_CLASS}
              />
            </label>
          </div>

          {(fieldError || formError) && (
            <p role="alert" className="text-xs font-medium text-brand-danger">
              {fieldError ?? formError}
            </p>
          )}

          <p className="text-[11px] leading-relaxed text-brand-text-muted">{copy.passwordNote}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-accent-strong px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
              )}
              {isSubmitting ? copy.passwordSaving : copy.passwordSave}
            </button>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand-border px-4 text-sm font-medium text-brand-text transition-colors hover:bg-brand-bg"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {copy.cancel}
            </button>
          </div>
        </form>
      )}

      {!open && (
        <p className="mt-3 text-xs text-brand-text-muted">
          {copy.passwordForgot}{' '}
          <Link
            href="/forgot-password"
            className="font-semibold text-brand-accent-strong hover:underline"
          >
            {copy.passwordAction}
          </Link>
        </p>
      )}
    </section>
  );
}
