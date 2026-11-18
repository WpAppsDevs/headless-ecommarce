'use client';

import { useState } from 'react';
import { Check, Loader2, Mail, Pencil, Phone, ShieldCheck, User, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateProfile, type UserProfile } from '@/lib/api/checkout';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';
import { personInitials, personName } from '@/lib/user-name';

const INPUT_CLASS =
  'h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light';

/** Name and email, edited in place. The schema carries the translated messages. */
export function ProfileCard({ profile }: { profile: UserProfile | null }) {
  const copy = useDictionary().account;
  const setProfile = useAuthStore((s) => s.setProfile);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({
    firstName: z.string().trim().min(1, copy.settings.requiredError),
    lastName: z.string().trim(),
    email: z.string().trim().min(1, copy.settings.requiredError).email(copy.settings.emailError),
  });

  type FormValues = z.infer<typeof schema>;

  const defaults: FormValues = {
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    email: profile?.email ?? '',
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const fullName = personName(profile, copy.customer);

  const startEditing = () => {
    reset(defaults);
    setFormError(null);
    setEditing(true);
  };

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const updated = await updateProfile({
        first_name: values.firstName,
        last_name: values.lastName,
        display_name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
      });
      setProfile(updated);
      setEditing(false);
      toast.success(copy.settings.saved);
    } catch {
      setFormError(copy.settings.saveFailed);
    }
  };

  return (
    <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-accent-light text-lg font-bold text-brand-accent-strong"
        >
          {personInitials(profile, '·')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-brand-text">{fullName}</p>
          <p className="truncate text-sm text-brand-text-muted">
            {profile?.email ?? copy.noEmail}
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-xs font-semibold text-brand-text transition-colors hover:border-brand-accent-strong hover:text-brand-accent-strong"
          >
            <Pencil className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            {copy.settings.edit}
          </button>
        )}
      </div>

      {editing ? (
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.settings.firstName}</span>
              <input {...register('firstName')} autoComplete="given-name" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted">
              <span>{copy.settings.lastName}</span>
              <input {...register('lastName')} autoComplete="family-name" className={INPUT_CLASS} />
            </label>
            <label className="space-y-1 text-xs font-medium text-brand-text-muted sm:col-span-2">
              <span>{copy.settings.email}</span>
              <input {...register('email')} type="email" autoComplete="email" className={INPUT_CLASS} />
            </label>
          </div>

          {(errors.firstName || errors.email) && (
            <p role="alert" className="text-xs font-medium text-brand-danger">
              {errors.firstName?.message ?? errors.email?.message}
            </p>
          )}
          {formError && (
            <p role="alert" className="text-xs font-medium text-brand-danger">
              {formError}
            </p>
          )}

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
              {isSubmitting ? copy.settings.saving : copy.settings.save}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand-border px-4 text-sm font-medium text-brand-text transition-colors hover:bg-brand-bg"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {copy.settings.cancel}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-text-muted" strokeWidth={1.6} aria-hidden="true" />
            <Value label={copy.settings.name} value={fullName} />
          </div>
          <div className="flex items-start gap-2.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-text-muted" strokeWidth={1.6} aria-hidden="true" />
            <Value label={copy.settings.email} value={profile?.email} />
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-text-muted" strokeWidth={1.6} aria-hidden="true" />
            <Value label={copy.settings.phone} value={profile?.billing?.phone} />
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-text-muted" strokeWidth={1.6} aria-hidden="true" />
            <Value
              label={copy.settings.accountId}
              value={profile ? `#${profile.id}` : undefined}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Value({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-brand-text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-brand-text">{value?.trim() || '—'}</p>
    </div>
  );
}
