import { config } from '@/lib/config';
import {
  RefreshCw,
  Package,
  Plane,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Banknote,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { BulletList } from '@/components/policies/BulletList';
import { Card } from '@/components/policies/Card';
import { NoteCallout } from '@/components/policies/NoteCallout';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { TypePanel } from '@/components/policies/TypePanel';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Returns & Exchange' }];

const STOCK_STEPS = [
  'Receive the product',
  'Check it in front of the courier',
  'If a fault is found',
  'Hand it back to the courier',
];

const STOCK_ELIGIBLE = [
  'The wrong product was sent',
  'The product has a manufacturing fault',
  'The product arrived damaged',
  'The product does not match what was ordered',
  'Other acceptable faults under our stated policy',
];

const PREORDER_ELIGIBLE = [
  'The wrong product was sent',
  'The product has a manufacturing fault, or arrived torn or defective',
];

const NOT_ELIGIBLE = [
  'The product was damaged through use',
  'The product was damaged by the customer',
  'The product is no longer in its original condition',
  'Our exchange policy is not met',
];

export function ReturnsContentEn() {
  return (
    <div>
      <PageHeader title="Returns & Exchange" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Eligibility */}
        <section className="mb-10">
          <SectionHeading icon={RefreshCw} title="Exchange eligibility" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              Eligibility for an exchange depends on the kind of product. Our two product types have
              separate exchange policies —{' '}
              <strong className="font-semibold text-brand-text">stock products</strong> and{' '}
              <strong className="font-semibold text-brand-text">pre-order products</strong>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              Checking the product in front of the courier representative on delivery makes an
              exchange quick and simple if one turns out to be needed.
            </p>
          </Card>
        </section>

        {/* Stock exchange */}
        <section className="mb-10">
          <TypePanel
            icon={Package}
            title="Stock product exchange"
            subtitle="Products held in stock in Bangladesh"
          >
            <p className="text-sm leading-relaxed text-brand-text-muted">
              When a stock product arrives, the customer must check it in front of the courier
              representative. If a fault that qualifies for exchange is found during that check, the
              customer can hand the product straight back to the courier.
            </p>

            <h3 className="mb-3 mt-7 text-sm font-semibold text-brand-text">Exchange steps</h3>
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STOCK_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="rounded-2xl border border-brand-border bg-brand-card p-4"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/15 text-xs font-bold text-brand-accent-strong">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-sm font-medium leading-snug text-brand-text">{step}</p>
                </li>
              ))}
            </ol>

            <h3 className="mb-3 mt-7 text-sm font-semibold text-brand-text">
              What exchange covers
            </h3>
            <BulletList items={STOCK_ELIGIBLE} />

            <NoteCallout icon={CheckCircle2} tone="accent" className="mt-6">
              <p className="font-semibold">
                Always check a stock product in front of the courier representative.
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Pre-order exchange */}
        <section className="mb-10">
          <TypePanel
            icon={Plane}
            title="Pre-order product exchange"
            subtitle="Imported from Pakistan — a separate policy"
          >
            <p className="text-sm leading-relaxed text-brand-text-muted">
              Pre-order products are brought from Pakistan to Bangladesh and involve international
              shipping. Their exchange policy therefore differs from stock products and can take
              longer.
            </p>

            <h3 className="mb-3 mt-7 text-sm font-semibold text-brand-text">
              Which pre-order problems exchange covers
            </h3>
            <BulletList items={PREORDER_ELIGIBLE} />

            <NoteCallout icon={AlertCircle} tone="amber" className="mt-6">
              <p className="font-semibold">Photos and colour</p>
              <p className="mt-1">
                The colour and photography of a real product can differ slightly from the photo shown
                on the site. That difference alone is not grounds for an exchange.
              </p>
            </NoteCallout>

            <NoteCallout icon={CheckCircle2} tone="accent" className="mt-4">
              <p className="font-semibold">
                Check pre-order products in front of the courier representative too.
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Not eligible */}
        <section className="mb-10">
          <SectionHeading icon={XCircle} title="Where exchange does not apply" />
          <Card>
            <BulletList items={NOT_ELIGIBLE} dotClassName="bg-brand-accent/60" />
          </Card>
        </section>

        {/* Refund policy */}
        <section className="mb-10">
          <SectionHeading icon={Banknote} title="Refund policy" />
          <Card>
            <p className="text-sm font-medium text-brand-text">
              We do not normally issue refunds.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              In exceptional cases a refund may be considered under our policy — for example:
            </p>
            <BulletList
              className="mt-3"
              items={[
                'The ordered product is not in stock',
                'We are unable to fulfil the order',
              ]}
            />
            <p className="mt-4 text-xs leading-relaxed text-brand-text-muted">
              An approved refund is processed under our stated policy. There is no conflicting
              deadline between the refund and exchange policies.
            </p>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <SectionHeading icon={Phone} title="Contact us about an exchange" />
          <Card>
            <p className="text-sm text-brand-text-muted">
              For anything relating to an exchange, get in touch:
            </p>
            <div className="mt-4 space-y-3">
              <a
                href="tel:+8801841654663"
                className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +880 1841-654663
              </a>
              <a
                href="mailto:support@najifasshop.com"
                className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" />
                support@najifasshop.com
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
          </Card>
        </section>
      </div>
    </div>
  );
}
