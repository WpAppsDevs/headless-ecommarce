import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, Phone, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, SectionHeading } from '@/components/policies/PolicyUI';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Najifa\'s Shop for order help, product questions, and wholesale enquiries.',
};

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Contact' }];

const CHANNELS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    detail: 'Fastest for order updates and styling questions.',
    href: 'https://wa.me/8801841654663',
    label: 'Chat on WhatsApp',
  },
  {
    icon: Mail,
    title: 'Email',
    detail: 'For detailed enquiries, invoices, and wholesale requests.',
    href: 'mailto:support@najifasshop.com',
    label: 'support@najifasshop.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    detail: 'Available during business hours for urgent order help.',
    href: 'tel:+8801841654663',
    label: '+880 1841-654663',
  },
];

export default function ContactPage() {
  return (
    <div>
      <PageHeader title="Contact Us" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="mb-10">
          <SectionHeading icon={MessageCircle} title="Talk to our team" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              We answer questions about sizing, stock, pre-orders, delivery, and
              returns. Include your order number when you write so we can find your
              order faster.
            </p>
          </Card>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, detail, href, label }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group rounded-2xl border border-brand-border bg-brand-section p-5 transition hover:border-brand-accent/50 hover:shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/10">
                <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.75} />
              </div>
              <h2 className="font-serif text-lg font-bold text-brand-text">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">{detail}</p>
              <p className="mt-3 text-sm font-medium text-brand-accent underline underline-offset-2">
                {label}
              </p>
            </a>
          ))}
        </div>

        <section className="mt-10">
          <SectionHeading icon={Clock} title="Before you write" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              You can check an order yourself with your email address on the{' '}
              <Link href="/track-order" className="font-medium text-brand-accent underline underline-offset-2">
                order tracking page
              </Link>
              . Delivery and exchange rules are in the{' '}
              <Link href="/shipping" className="font-medium text-brand-accent underline underline-offset-2">
                shipping policy
              </Link>{' '}
              and{' '}
              <Link href="/returns" className="font-medium text-brand-accent underline underline-offset-2">
                returns policy
              </Link>
              .
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
