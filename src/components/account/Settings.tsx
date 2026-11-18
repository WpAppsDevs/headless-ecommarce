'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Mail, Pencil, Phone, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile, type UserProfile } from '@/lib/api/checkout';
import { useAuthStore } from '@/stores/authStore';
import { useDictionary } from '@/i18n/LocaleProvider';
import { config } from '@/lib/config';

interface SettingsTabProps {
  profile: UserProfile | null;
}

function Value({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-brand-text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-brand-text">{value?.trim() || '—'}</p>
    </div>
  );
}

export function SettingsTab({ profile }: SettingsTabProps) {
  const copy = useDictionary().account;
  const router = useRouter();
  const setProfile = useAuthStore((s) => s.setProfile);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.display_name ||
    copy.customer;

  const startEditing = () => {
    setFirstName(profile?.first_name ?? '');
    setLastName(profile?.last_name ?? '');
    setEmail(profile?.email ?? '');
    setFormError(null);
    setEditing(true);
  };

  const save = async () => {
    if (!firstName.trim() || !email.trim()) {
      setFormError(copy.settings.requiredError);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
      });
      setProfile(updated);
      setEditing(false);
      toast.success(copy.settings.saved);
    } catch {
      setFormError(copy.settings.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-accent-strong focus:ring-2 focus:ring-brand-accent-light';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-brand-text">
          {copy.settings.title}
        </h2>
        <p className="mt-1 text-sm text-brand-text-muted">{copy.settings.note}</p>
      </div>

      <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-accent-light text-lg font-bold text-brand-accent-strong"
          >
            {fullName.charAt(0).toUpperCase() || '·'}
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
          <form
            method="post"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-brand-text-muted">
                <span>{copy.settings.firstName}</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-brand-text-muted">
                <span>{copy.settings.lastName}</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-brand-text-muted sm:col-span-2">
                <span>{copy.settings.email}</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                />
              </label>
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-brand-danger">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-accent-strong px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-strong-hover disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                )}
                {saving ? copy.settings.saving : copy.settings.save}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex min-h-10 items-center rounded-lg border border-brand-border px-4 text-sm font-medium text-brand-text transition-colors hover:bg-brand-bg"
              >
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
              <div>
                <Value label={copy.settings.phone} value={profile?.billing?.phone} />
                <button
                  type="button"
                  onClick={() => {
                    router.replace('/account?tab=address', { scroll: false });
                  }}
                  className="mt-1 text-[11px] font-semibold text-brand-accent-strong hover:underline"
                >
                  {copy.settings.editInAddress}
                </button>
              </div>
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

        <div className="mt-6 space-y-2 border-t border-brand-border pt-4">
          <p className="text-sm font-medium text-brand-text">{copy.settings.passwordTitle}</p>
          <p className="text-xs leading-relaxed text-brand-text-muted">
            {copy.settings.passwordBody}{' '}
            <Link
              href="/forgot-password"
              className="font-semibold text-brand-accent-strong hover:underline"
            >
              {copy.settings.passwordAction}
            </Link>
          </p>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-brand-border pt-4">
          <p className="text-xs leading-relaxed text-brand-text-muted">
            {copy.settings.supportLead}{' '}
            <a
              href={config.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-accent-strong hover:underline"
            >
              WhatsApp
            </a>{' '}
            {copy.settings.supportOrEmail}{' '}
            <a
              href={`mailto:${config.supportEmail}`}
              className="font-semibold text-brand-accent-strong hover:underline"
            >
              {config.supportEmail}
            </a>
          </p>
          <p className="text-xs leading-relaxed text-brand-text-muted">
            {copy.settings.noteTail}{' '}
            <Link
              href="/privacy-policy"
              className="font-semibold text-brand-accent-strong hover:underline"
            >
              {copy.settings.privacyPolicy}
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
