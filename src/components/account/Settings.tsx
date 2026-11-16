'use client';

import Link from 'next/link';
import { Mail, Phone, ShieldCheck, User } from 'lucide-react';
import type { UserProfile } from '@/lib/api/checkout';
import { useDictionary } from '@/i18n/LocaleProvider';
import { config } from '@/lib/config';

interface SettingsTabProps {
  profile: UserProfile | null;
}

function Value({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: string | null;
  fallback: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value?.trim() || fallback}</p>
    </div>
  );
}

export function SettingsTab({ profile }: SettingsTabProps) {
  const copy = useDictionary().account;
  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.display_name ||
    copy.customer;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">{copy.settings.title}</h2>

      <div className="rounded-xl border border-zinc-200 bg-white p-7">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-xl font-bold text-zinc-600">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-900">{fullName}</p>
            <p className="text-sm text-zinc-500">{profile?.email ?? copy.noEmail}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value label={copy.settings.name} value={fullName} fallback={copy.notSet} />
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value label={copy.settings.email} value={profile?.email} fallback={copy.notSet} />
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value
              label={copy.settings.phone}
              value={profile?.billing?.phone}
              fallback={copy.notSet}
            />
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value
              label={copy.settings.accountId}
              value={profile ? `#${profile.id}` : undefined}
              fallback={copy.notSet}
            />
          </div>
        </div>

        <div className="mt-7 border-t border-zinc-100 pt-5">
          <p className="text-sm leading-relaxed text-zinc-500">
            {copy.settings.noteLead}{' '}
            <a
              href={config.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 underline underline-offset-2"
            >
              WhatsApp
            </a>{' '}
            {copy.settings.noteOrEmail}{' '}
            <a
              href="mailto:support@najifasshop.com"
              className="font-medium text-zinc-800 underline underline-offset-2"
            >
              support@najifasshop.com
            </a>
            {copy.settings.noteTail}{' '}
            <Link href="/privacy-policy" className="font-medium text-zinc-800 underline underline-offset-2">
              {copy.settings.privacyPolicy}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
