import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ShieldCheck, Info, CheckCircle2, Users, Cookie, Lock, Mail, Phone, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { BulletList } from '@/components/policies/BulletList';
import { Card } from '@/components/policies/Card';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { config } from '@/lib/config';

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Privacy Policy' },
];

function Section({
  icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <SectionHeading icon={icon} title={title} />
      <Card>{children}</Card>
    </section>
  );
}

export function PrivacyPolicyContentEn() {
  return (
    <div>
      <PageHeader title="Privacy Policy" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="mb-10 text-sm text-brand-text-muted">
          Last updated: October 2026
        </Card>

        <Section icon={ShieldCheck} title="Introduction">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            Welcome to our store. We are committed to protecting the privacy of your personal
            information. This Privacy Policy explains what information we collect, how we use it,
            and how we store it.
          </p>
        </Section>

        <Section icon={Info} title="Information we collect">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            We may collect the following information:
          </p>
          <BulletList
            items={[
              'Name',
              'Mobile number',
              'Email address',
              'Delivery address',
              'Billing information',
              'IP address',
              'Browser and device information',
            ]}
          />
        </Section>

        <Section icon={CheckCircle2} title="How we use your information">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            We use your information:
          </p>
          <BulletList
            items={[
              'To process and deliver orders',
              'To provide customer support',
              'To send order updates',
              'To improve how the website works',
              'To prevent fraud',
            ]}
          />
        </Section>

        <Section icon={Users} title="Sharing information">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            We do not sell your personal information.
          </p>
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            Where necessary, information may be shared with:
          </p>
          <BulletList items={['Courier services', 'Payment gateway', 'Website service providers']} />
        </Section>

        <Section icon={Cookie} title="Cookies">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            Our website may use cookies to improve your experience. Cookies are small data files
            stored in your browser.
          </p>
        </Section>

        <Section icon={Lock} title="Data security">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            We take reasonable technical and administrative measures to keep your information safe.
            No transmission over the internet is completely secure, however, so we cannot guarantee
            it.
          </p>
        </Section>

        <Section icon={Mail} title="Contact">
          <p className="mb-4 text-sm leading-relaxed text-brand-text-muted">
            For any question about this Privacy Policy, contact us:
          </p>
          <div className="space-y-3">
            <a
              href="mailto:support@najifasshop.com"
              className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0" />
              support@najifasshop.com
            </a>
            <a
              href="tel:+8801841654663"
              className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
            >
              <Phone className="h-4 w-4 shrink-0" />
              +880 1841-654663
            </a>
            <a
              href={config.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Message us on WhatsApp
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}
