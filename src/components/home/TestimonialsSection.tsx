import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Tahmina Akter',
    location: 'Dhaka, Bangladesh',
    badge: 'Ready Stock',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    avatar: '/images/testimonials/avatar-1.jpg',
    rating: 5,
    text: '"The lawn suit arrived in 3 days! Quality is exactly like the photos — fabric is so soft and the embroidery is gorgeous. Will definitely order again for Eid."',
  },
  {
    name: 'Roksana Begum',
    location: 'Chittagong, Bangladesh',
    badge: 'Pre-Order',
    badgeColor: 'bg-amber-100 text-amber-700',
    avatar: '/images/testimonials/avatar-2.jpg',
    rating: 5,
    text: '"Pre-ordered the luxury formal collection and it came in 12 days exactly as promised. The packaging was beautiful and the dress fits perfectly. 100% authentic!"',
  },
  {
    name: 'Nasrin Sultana',
    location: 'Sylhet, Bangladesh',
    badge: 'Ready Stock',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    avatar: '/images/testimonials/avatar-3.jpg',
    rating: 5,
    text: '"Ordered for my daughter\'s wedding. The embroidered dress was absolutely stunning. Everyone asked where I got it from. Best Pakistani dress seller in Bangladesh!"',
  },
  {
    name: 'Farhana Islam',
    location: 'Rajshahi, Bangladesh',
    badge: 'Wholesale',
    badgeColor: 'bg-zinc-100 text-zinc-700',
    avatar: '/images/testimonials/avatar-4.jpg',
    rating: 5,
    text: '"I resell their catalog collection and my customers love it. The prices are fair, quality is consistent, and the team is very helpful with bulk orders. Highly recommended for resellers!"',
  },
];

export function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-brand-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Customer Reviews
          </p>
          <h2 id="testimonials-heading" className="mt-2 font-serif text-3xl font-bold text-brand-text sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Real experiences from our customers across Bangladesh.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-accent text-brand-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-zinc-600">{t.text}</p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-zinc-50 pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">{t.name}</p>
                  <p className="truncate text-xs text-zinc-400">{t.location}</p>
                </div>
                <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.badgeColor}`}>
                  {t.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
