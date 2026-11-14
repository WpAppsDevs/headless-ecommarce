import { ShieldCheck, Truck, Star, HeadphonesIcon } from 'lucide-react';
import { EditorialHeading } from '@/components/home/EditorialHeading';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    desc: 'Direct from trusted Pakistani manufacturers',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Ready stock in 2–5 days across Bangladesh',
  },
  {
    icon: Star,
    title: 'Premium Quality',
    desc: 'Carefully curated fabrics and craftsmanship',
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Support',
    desc: 'WhatsApp & call support 7 days a week',
  },
];

export function FeaturesStrip() {
  return (
    <section aria-labelledby="why-us-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <EditorialHeading
          id="why-us-heading"
          eyebrow="Our Promise"
          title="Why Choose Us"
        />

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-4 rounded-xl border border-brand-border bg-brand-section p-6 text-center transition-colors duration-300 hover:border-brand-accent-strong/40 cursor-default"
            >
              {/* Icon tile */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-accent-light">
                <Icon className="h-6 w-6 text-brand-accent-strong" strokeWidth={1.5} />
              </div>

              {/* Accent rule */}
              <div className="h-px w-8 rounded-full bg-brand-accent/40" />

              {/* Text */}
              <div>
                <p className="text-sm font-semibold text-brand-text">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
