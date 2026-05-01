import { Search, ShoppingBag, Package, Sparkles } from 'lucide-react';

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
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full bg-brand-accent/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Pre-Order Process
          </span>
          <h2 id="preorder-heading" className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">
            How Pre-Order Works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            Get your dream Pakistani dress delivered to your doorstep in just 4 simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, icon: Icon, title, desc }) => (
            <div
              key={step}
              className="relative overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-accent/[0.06] p-6"
            >
              {/* Ghost step number — decorative */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-3 select-none font-mono text-5xl font-extrabold leading-none text-white/[0.07]"
              >
                {step}
              </span>

              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/20">
                <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.5} />
              </div>

              {/* Step indicator */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1 w-4 rounded-full bg-brand-accent/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-accent/70">
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
