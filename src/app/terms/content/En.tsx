import { CheckCircle2, Package, Banknote, ShoppingCart, FileText, Scale, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { BulletList } from '@/components/policies/BulletList';
import { Card } from '@/components/policies/Card';
import { Section } from '@/components/policies/Section';

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Terms of Service' },
];

export function TermsContentEn() {
  return (
    <div>
      <PageHeader title="Terms of Service" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="mb-10 text-sm text-brand-text-muted">
          Last updated: October 2026
        </Card>

        <Section icon={CheckCircle2} title="Acceptance">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            By using this website you agree to our Terms &amp; Conditions. If you do not agree with
            these terms, please do not use the website.
          </p>
        </Section>

        <Section icon={Package} title="Product information">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            We try to show product photos and descriptions as accurately as we can. Display settings
            on your device can still cause slight colour differences, and that is not treated as a
            fault in the product.
          </p>
        </Section>

        <Section icon={Banknote} title="Pricing">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            We reserve the right to change product prices without prior notice. An order placed
            before a price change stays valid at the price it was placed at.
          </p>
        </Section>

        <Section icon={ShoppingCart} title="Order acceptance">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            An order may be cancelled in the following cases:
          </p>
          <BulletList
            items={[
              'The product is not in stock',
              'An incorrect price was shown',
              'The order is suspicious or fraudulent',
            ]}
          />
          <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
            If an order is cancelled we will let you know as soon as possible.
          </p>
        </Section>

        <Section icon={FileText} title="Intellectual property">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            All content, photos, logos and designs on this website are the property of our store.
            Using, copying or distributing them without prior permission is not allowed.
          </p>
        </Section>

        <Section icon={Scale} title="Limitation of liability">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            We are not liable for indirect loss, business loss or loss of profit. Our maximum
            liability is limited to the price you paid for the product.
          </p>
        </Section>

        <Section icon={RefreshCw} title="Changes to these terms">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            We may change these terms at any time. Changes are published on this page. Continuing to
            use the website means you accept the changed terms.
          </p>
        </Section>
      </div>
    </div>
  );
}
