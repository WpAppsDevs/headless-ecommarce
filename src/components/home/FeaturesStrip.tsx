import { ShieldCheck, Truck, Star, HeadphonesIcon } from 'lucide-react';

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
    <section aria-labelledby="why-us-heading" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Our Promise
          </p>
          <h2 id="why-us-heading" className="mt-2 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
            Why Choose Us
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl bg-brand-bg p-5 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
                <Icon className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
