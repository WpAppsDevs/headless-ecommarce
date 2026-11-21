import Link from 'next/link';
import { Card } from '@/components/policies/Card';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { Clock } from 'lucide-react';

export function ContactBeforeEn() {
  return (
    <section className="mt-10">
      <SectionHeading icon={Clock} title="Before you write" />
      <Card>
        <p className="text-sm leading-relaxed text-brand-text-muted">
          You can check an order yourself with your email address on the{' '}
          <Link
            href="/track-order"
            className="font-medium text-brand-accent-strong underline underline-offset-2"
          >
            order tracking page
          </Link>
          . Delivery and exchange rules are in the{' '}
          <Link
            href="/shipping"
            className="font-medium text-brand-accent-strong underline underline-offset-2"
          >
            shipping policy
          </Link>{' '}
          and{' '}
          <Link
            href="/returns"
            className="font-medium text-brand-accent-strong underline underline-offset-2"
          >
            returns policy
          </Link>
          .
        </p>
      </Card>
    </section>
  );
}

export const contactChannels = [
  { detail: 'Fastest for order updates and styling questions.', label: 'Chat on WhatsApp' },
  { detail: 'For detailed enquiries, invoices, and wholesale requests.', label: 'support@najifasshop.com' },
  { detail: 'Available during business hours for urgent order help.', label: '+880 1841-654663' },
];
