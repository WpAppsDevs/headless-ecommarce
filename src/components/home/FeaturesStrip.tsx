import { ShieldCheck, Truck, Star, RotateCcw, HeadphonesIcon, Package } from 'lucide-react';

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
    icon: Package,
    title: 'Secure Packaging',
    desc: 'Garments arrive fresh and wrinkle-free',
  },
  {
    icon: RotateCcw,
    title: 'Easy Exchange',
    desc: '7-day exchange policy on ready stock',
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Support',
    desc: 'WhatsApp & call support 7 days a week',
  },
];

export function FeaturesStrip() {
  return (
    <section aria-labelledby="why-us-heading" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C4867A]">
            Our Promise
          </p>
          <h2 id="why-us-heading" className="mt-2 font-serif text-3xl font-bold text-[#7C3D52] sm:text-4xl">
            Why Choose Us
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl bg-[#F7ECEA] p-5 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C3D52]/10">
                <Icon className="h-5 w-5 text-[#7C3D52]" />
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
