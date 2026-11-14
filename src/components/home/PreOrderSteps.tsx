import { Search, ShoppingBag, Package, Sparkles } from 'lucide-react';
import { EditorialHeading } from '@/components/home/EditorialHeading';

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Browse & Select',
    desc: 'Explore our pre-order catalog and choose your favorite Pakistani dress, color, and size.',
  },
  {
    step: '02',
    icon: ShoppingBag,
    title: 'Place Your Order',
    desc: 'Complete your order and payment. We confirm availability and lock your item within 24 hours.',
  },
  {
    step: '03',
    icon: Package,
    title: 'We Import for You',
    desc: 'Your dress is sourced directly from our trusted suppliers in Pakistan and shipped to Bangladesh.',
  },
  {
    step: '04',
    icon: Sparkles,
    title: 'Receive & Enjoy',
    desc: 'Your order arrives in 15–25 days, carefully packaged and ready to wear.',
  },
];

export function PreOrderSteps() {
  return (
    <section aria-labelledby="preorder-heading" className="bg-brand-dark-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <EditorialHeading
          id="preorder-heading"
          tone="dark"
          eyebrow="Pre-Order Process"
          title="How Pre-Order Works"
          description="Your dress is sourced in Pakistan after you order. Four steps, 15–25 days, tracked the whole way."
        />

        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, icon: Icon, title, desc }) => (
            <div
              key={step}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.06]"
            >
              {/* Ghost step number — decorative */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-3 select-none font-mono text-5xl font-extrabold leading-none text-white/[0.07]"
              >
                {step}
              </span>

              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/20 transition-colors duration-300 group-hover:bg-brand-accent/30">
                <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.5} />
              </div>

              {/* Step indicator */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1 w-4 rounded-full bg-brand-accent/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-accent">
                  Step {step}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
