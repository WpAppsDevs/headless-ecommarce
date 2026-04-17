'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const SLIDES = [
  {
    bg: 'from-zinc-900 via-zinc-800 to-zinc-700',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80',
    eyebrow: 'New Season',
    title: 'Elevate Your\nGame Today',
    subtitle: 'Unlock your strength and go beyond limits.',
    cta: 'Shop Now',
    ctaHref: '/products',
    align: 'left',
  },
  {
    bg: 'from-slate-900 via-slate-800 to-slate-700',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80',
    eyebrow: 'Activewear',
    title: 'Move with\nConfidence',
    subtitle: 'Activewear that supports every move.',
    cta: 'Explore Collection',
    ctaHref: '/products',
    align: 'center',
  },
  {
    bg: 'from-neutral-900 via-neutral-800 to-neutral-700',
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=1600&q=80',
    eyebrow: 'Premium',
    title: 'Built for\nMotion',
    subtitle: 'Premium sportswear built to power every move.',
    cta: 'View All Products',
    ctaHref: '/products',
    align: 'right',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[85vh] min-h-[520px] max-h-[760px] overflow-hidden bg-zinc-900">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={current}
        src={slide.image}
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
          animating ? 'opacity-0' : 'opacity-100',
        )}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div
          className={cn(
            'mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16',
            slide.align === 'center' && 'text-center',
            slide.align === 'right' && 'text-right',
          )}
        >
          <div
            className={cn(
              'max-w-xl',
              slide.align === 'center' && 'mx-auto',
              slide.align === 'right' && 'ml-auto',
            )}
          >
            <span
              className={cn(
                'mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm transition-all duration-500',
                animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
              )}
            >
              {slide.eyebrow}
            </span>
            <h1
              className={cn(
                'whitespace-pre-line text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl transition-all duration-500 delay-75',
                animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
              )}
            >
              {slide.title}
            </h1>
            <p
              className={cn(
                'mt-4 text-lg text-white/80 transition-all duration-500 delay-150',
                animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
              )}
            >
              {slide.subtitle}
            </p>
            <div
              className={cn(
                'mt-8 flex gap-4 transition-all duration-500 delay-200',
                slide.align === 'center' && 'justify-center',
                slide.align === 'right' && 'justify-end',
                animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
              )}
            >
              <Link
                href={slide.ctaHref}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-white text-zinc-900 hover:bg-zinc-100 font-semibold rounded-full px-8',
                )}
              >
                {slide.cta}
              </Link>
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'border-white/50 text-white hover:bg-white/10 hover:text-white rounded-full px-8 backdrop-blur-sm',
                )}
              >
                Explore All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/40',
            )}
          />
        ))}
      </div>
    </section>
  );
}
