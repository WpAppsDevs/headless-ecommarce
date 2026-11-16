import {
  MapPin,
  Package,
  Plane,
  Clock,
  Truck,
  AlertCircle,
  Phone,
  Scale,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/policies/Card';
import { NoteCallout } from '@/components/policies/NoteCallout';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { StatCard } from '@/components/policies/StatCard';
import { TypePanel } from '@/components/policies/TypePanel';
import { formatNumber, formatTaka } from '@/i18n/format';
import {
  EXTRA_KG_CHARGE,
  INCLUDED_KG,
  LOCAL_DELIVERY,
  PRE_ORDER_PER_KG,
  WEIGHT_EXAMPLES,
} from '../rates';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Shipping & Delivery' }];

export function ShippingContentEn() {
  return (
    <div>
      <PageHeader title="Shipping & Delivery" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Coverage */}
        <section className="mb-10">
          <SectionHeading icon={MapPin} title="Delivery coverage" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              We deliver to every district in Bangladesh.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              We sell two kinds of product — <strong className="font-semibold text-brand-text">stock products</strong> and{' '}
              <strong className="font-semibold text-brand-text">pre-order products</strong>. Delivery times
              and charges for each are given separately below.
            </p>
          </Card>
        </section>

        {/* Stock products */}
        <section className="mb-10">
          <TypePanel
            icon={Package}
            title="Stock products"
            subtitle="Products we currently hold in stock in Bangladesh"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Clock className="h-4 w-4 text-brand-accent-strong" />
              Delivery time
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="Dhaka city" value="1–3" sub="working days" />
              <StatCard label="Outside Dhaka" value="2–5" sub="working days" />
            </div>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Truck className="h-4 w-4 text-brand-accent-strong" />
              Delivery charge
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="Inside Dhaka" value={formatTaka('en', LOCAL_DELIVERY.insideDhaka)} />
              <StatCard label="Outside Dhaka" value={formatTaka('en', LOCAL_DELIVERY.outsideDhaka)} />
            </div>

            <NoteCallout icon={Scale} tone="accent" className="mt-4">
              <p className="font-semibold">Extra weight charge:</p>
              <p className="mt-1">
                For a product heavier than {formatNumber('en', INCLUDED_KG)} kg,{' '}
                {formatTaka('en', EXTRA_KG_CHARGE)} is added for every extra kilogram or part of a
                kilogram. A partial weight counts as the next full kilogram.
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Pre-order products */}
        <section className="mb-10">
          <TypePanel
            icon={Plane}
            title="Pre-order products"
            subtitle="Brought to Bangladesh from Pakistan"
          >
            <p className="text-sm leading-relaxed text-brand-text-muted">
              Pre-order products are brought from Pakistan to Bangladesh. Once a product reaches
              Bangladesh, we deliver it to the customer.
            </p>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Clock className="h-4 w-4 text-brand-accent-strong" />
              Estimated delivery time
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="Total estimated time" value="20–25" sub="days" />
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5">
                <p className="text-sm leading-relaxed text-brand-text-muted">
                  This window covers both steps: the product travelling from Pakistan to Bangladesh,
                  and the local delivery to the customer once it arrives.
                </p>
                <p className="mt-3 text-xs font-medium leading-relaxed text-brand-accent-strong">
                  This is an estimate — not a fixed or guaranteed timeframe.
                </p>
              </div>
            </div>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Scale className="h-4 w-4 text-brand-accent-strong" />
              Shipping and delivery charges
            </h3>

            {/* Pakistan → Bangladesh (per kg) */}
            <div className="rounded-2xl border border-brand-accent/25 bg-brand-accent/[0.06] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-brand-text">Pakistan → Bangladesh</p>
                <p className="font-serif text-2xl font-bold text-brand-accent-strong">
                  {formatTaka('en', PRE_ORDER_PER_KG)}
                </p>
                <p className="text-xs text-brand-text-muted">per kg</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
                Shipping is charged on the total weight of the product or shipment.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {WEIGHT_EXAMPLES.map((kg) => (
                  <div
                    key={kg}
                    className="rounded-xl border border-brand-border bg-brand-section px-3 py-2.5 text-center"
                  >
                    <p className="text-xs text-brand-text-muted">
                      {formatNumber('en', kg)} kg
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-brand-text">
                      {formatTaka('en', kg * PRE_ORDER_PER_KG)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bangladesh → Customer (local) */}
            <div className="mt-4 rounded-2xl border border-brand-border bg-brand-card p-5">
              <p className="text-sm font-semibold text-brand-text">Bangladesh → Customer</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
                Local delivery charge once the product reaches Bangladesh, based on the customer&apos;s
                address:
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="Inside Dhaka"
                  value={formatTaka('en', LOCAL_DELIVERY.insideDhaka)}
                  className="bg-brand-section"
                />
                <StatCard
                  label="Outside Dhaka"
                  value={formatTaka('en', LOCAL_DELIVERY.outsideDhaka)}
                  className="bg-brand-section"
                />
              </div>
            </div>

            <NoteCallout icon={Scale} tone="accent" className="mt-4">
              <p className="font-semibold">Extra weight charge:</p>
              <p className="mt-1">
                For a product heavier than {formatNumber('en', INCLUDED_KG)} kg,{' '}
                {formatTaka('en', EXTRA_KG_CHARGE)} is added for every extra kilogram or part of a
                kilogram. A partial weight counts as the next full kilogram.
              </p>
            </NoteCallout>

            <NoteCallout icon={AlertCircle} tone="accent" className="mt-4">
              <p className="font-semibold">Important</p>
              <p className="mt-1">
                On a pre-order, shipping from Pakistan to Bangladesh is{' '}
                <strong className="font-semibold">
                  {formatTaka('en', PRE_ORDER_PER_KG)} per kg
                </strong>
                , and the local delivery charge after the product reaches Bangladesh is{' '}
                <strong className="font-semibold">
                  {formatTaka('en', LOCAL_DELIVERY.insideDhaka)}/
                  {formatTaka('en', LOCAL_DELIVERY.outsideDhaka)}
                </strong>{' '}
                — the two are charged separately.
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Delivery delays */}
        <section className="mb-10">
          <SectionHeading
            icon={AlertCircle}
            title="Delivery delays"
            subtitle="Deliveries can be delayed by situations we cannot control"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NoteCallout icon={Package} tone="amber">
              <p className="font-semibold">Stock products</p>
              <p className="mt-1">
                Public holidays, natural disasters, courier problems or other unforeseen situations
                can delay a stock delivery temporarily.
              </p>
            </NoteCallout>
            <NoteCallout icon={Plane} tone="amber">
              <p className="font-semibold">Pre-orders</p>
              <p className="mt-1">
                Moving a product from Pakistan to Bangladesh can take longer than the stated window
                because of shipment, logistics, customs clearance or other unforeseen problems.
              </p>
              <p className="mt-2 font-medium">
                20–25 days is an estimated delivery time.
              </p>
            </NoteCallout>
          </div>
        </section>

        {/* Order confirmation */}
        <section>
          <SectionHeading icon={Phone} title="Order confirmation" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              Our team may contact the customer by phone or SMS, if necessary, to confirm an order.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
