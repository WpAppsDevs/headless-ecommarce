const STEPS = [
  {
    step: '01',
    title: 'Browse & Select',
    desc: 'Explore our pre-order catalog and choose your favorite Pakistani dress, color, and size.',
  },
  {
    step: '02',
    title: 'Place Your Order',
    desc: 'Complete your order and payment. We confirm availability and lock your item within 24 hours.',
  },
  {
    step: '03',
    title: 'We Import for You',
    desc: 'Your dress is sourced directly from our trusted suppliers in Pakistan and shipped to Bangladesh.',
  },
  {
    step: '04',
    title: 'Receive & Enjoy',
    desc: 'Your order arrives in 10–15 days, carefully packaged and ready to wear.',
  },
];

export function PreOrderSteps() {
  return (
    <section aria-labelledby="preorder-heading" className="bg-[#7C3D52] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C4867A]">
            Pre-Order Process
          </p>
          <h2 id="preorder-heading" className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
            How Pre-Order Works
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Get your dream Pakistani dress delivered in 4 simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, title, desc }, idx) => (
            <div key={step} className="relative flex flex-col gap-4">
              {/* Connector line (desktop) */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-[calc(50%+2rem)] top-6 hidden h-px w-[calc(100%+1.5rem)] bg-[#C4867A]/30 lg:block"
                />
              )}

              {/* Step number circle */}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C4867A] bg-[#7C3D52]">
                <span className="font-mono text-sm font-bold text-[#C4867A]">{step}</span>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
