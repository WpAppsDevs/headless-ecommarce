import { Truck, RotateCcw, ShieldCheck, HeadphonesIcon } from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'On all orders over $50',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day return policy',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    desc: '100% protected transactions',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    desc: 'Always here to help you',
  },
];

export function FeaturesStrip() {
  return (
    <section className="border-b border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
