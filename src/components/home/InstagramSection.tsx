import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function IgIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const IG_POSTS = [
  '/images/instagram/post-1.jpg',
  '/images/instagram/post-2.jpg',
  '/images/instagram/post-3.jpg',
  '/images/instagram/post-4.jpg',
  '/images/instagram/post-5.jpg',
  '/images/instagram/post-6.jpg',
];

export function InstagramSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <IgIcon className="h-8 w-8 text-pink-500" />
          <h2 className="text-3xl font-bold tracking-tight">Follow Us On Instagram</h2>
          <p className="text-muted-foreground">
            Tag us{' '}
            <span className="font-semibold text-foreground">@YourStore</span> for a chance to be featured.
          </p>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'mt-1 gap-2 rounded-full',
            )}
          >
            <IgIcon className="h-4 w-4" />
            Follow on Instagram
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {IG_POSTS.map((src, i) => (
            <Link
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Instagram post ${i + 1}`}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                <IgIcon className="h-6 w-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
