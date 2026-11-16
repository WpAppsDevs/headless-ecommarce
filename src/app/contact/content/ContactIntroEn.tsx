import Link from 'next/link';
import { Card } from '@/components/policies/Card';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { Clock, MessageCircle } from 'lucide-react';

export const contactCopyEn = {
  metadataTitle: 'Contact Us',
  metadataDescription:
    "Contact Najifa's Shop for order help, product questions, and wholesale enquiries.",
  pageTitle: 'Contact Us',
  breadcrumb: 'Contact',
};


export function ContactIntroEn() {
  return (
    <section className="mb-10">
      <SectionHeading icon={MessageCircle} title="Talk to our team" />
      <Card>
        <p className="text-sm leading-relaxed text-brand-text-muted">
          We answer questions about sizing, stock, pre-orders, delivery, and returns.
          Include your order number when you write so we can find your order faster.
        </p>
      </Card>
    </section>
  );
}
