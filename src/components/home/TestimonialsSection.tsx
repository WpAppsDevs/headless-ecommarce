import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Jenna L.',
    role: 'Yoga Instructor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    rating: 5,
    text: '"Super comfortable and breathable — perfect for my daily workouts. The fabric feels amazing against the skin."',
  },
  {
    name: 'Marcus T.',
    role: 'Personal Trainer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    rating: 5,
    text: '"The fit is amazing. Stylish, flexible, and great for the gym. I get compliments every session!"',
  },
  {
    name: 'Sofia R.',
    role: 'Marathon Runner',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    rating: 5,
    text: '"Quality is top-notch. I feel more confident every time I wear it. Fast delivery and great packaging too."',
  },
  {
    name: 'Daniel K.',
    role: 'CrossFit Athlete',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    rating: 5,
    text: '"Love the fabric! Lightweight and moves with me during every session. Best activewear I\'ve ever bought."',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-900/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Reviews
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">What Our Customers Say</h2>
          <p className="mt-2 text-muted-foreground">
            Real feedback from those who train, move, and live in our gear.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border bg-background p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{t.text}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
