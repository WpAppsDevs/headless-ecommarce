'use client';

import Link from 'next/link';
import { Mail, Phone, ShieldCheck, User } from 'lucide-react';
import type { UserProfile } from '@/lib/api/checkout';

interface SettingsTabProps {
  profile: UserProfile | null;
}

function Value({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value?.trim() || 'Not set'}</p>
    </div>
  );
}

export function SettingsTab({ profile }: SettingsTabProps) {
  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.display_name ||
    'Customer';

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">Account details</h2>

      <div className="rounded-xl border border-zinc-200 bg-white p-7">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-xl font-bold text-zinc-600">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-900">{fullName}</p>
            <p className="text-sm text-zinc-500">{profile?.email ?? 'No email on file'}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value label="Name" value={fullName} />
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value label="Email" value={profile?.email} />
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value label="Phone" value={profile?.billing?.phone} />
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <Value label="Account ID" value={profile ? `#${profile.id}` : undefined} />
          </div>
        </div>

        <div className="mt-7 border-t border-zinc-100 pt-5">
          <p className="text-sm leading-relaxed text-zinc-500">
            Profile and password changes are handled by our support team while the
            account API is being completed. Message us on{' '}
            <a
              href="https://wa.me/8801841654663"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 underline underline-offset-2"
            >
              WhatsApp
            </a>{' '}
            or email{' '}
            <a
              href="mailto:support@najifasshop.com"
              className="font-medium text-zinc-800 underline underline-offset-2"
            >
              support@najifasshop.com
            </a>
            . You can also read the{' '}
            <Link href="/privacy-policy" className="font-medium text-zinc-800 underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
