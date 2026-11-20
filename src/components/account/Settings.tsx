'use client';

import Link from 'next/link';
import type { UserProfile } from '@/lib/api/checkout';
import { useDictionary } from '@/i18n/LocaleProvider';
import { AddressCards } from './AddressCards';
import { PasswordCard } from './PasswordCard';
import { ProfileCard } from './ProfileCard';
import { SupportContactLinks } from '@/components/policies/SupportContactLinks';
import { AccountHeading } from './AccountHeading';

interface SettingsTabProps {
  profile: UserProfile | null;
}

/** One page for everything a customer can change about their account. */
export function SettingsTab({ profile }: SettingsTabProps) {
  const copy = useDictionary().account;

  return (
    <div className="space-y-4">
      <AccountHeading title={copy.settings.title} description={copy.settings.note} />

      <ProfileCard profile={profile} />
      <AddressCards profile={profile} />
      <PasswordCard />

      <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-brand-text">{copy.settings.supportLead}</h3>
        <SupportContactLinks whatsappLabel="WhatsApp" />
        <p className="mt-4 border-t border-brand-border pt-4 text-xs leading-relaxed text-brand-text-muted">
          {copy.settings.noteTail}{' '}
          <Link
            href="/privacy-policy"
            className="font-semibold text-brand-accent-strong hover:underline"
          >
            {copy.settings.privacyPolicy}
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
