'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/lib/api/products';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23f1f5f9%22/%3E%3C/svg%3E';

interface Props {
  images: ProductImage[];
  name: string;
  isOnSale?: boolean;
}

export function ProductImages({ images, name, isOnSale }: Props) {
  const [active, setActive] = useState(0);
  const src = images[active]?.url || PLACEHOLDER;
  const alt = images[active]?.alt || name;

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {/* Thumbnail strip — horizontal on mobile, vertical on desktop */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={img.alt || `Image ${i + 1}`}
              className={cn(
                'relative h-16 w-16 lg:h-20 lg:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                active === i
                  ? 'border-zinc-900 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80',
              )}
            >
              <Image
                src={img.url || PLACEHOLDER}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="group relative aspect-[4/5] min-w-0 flex-1 overflow-hidden rounded-2xl bg-zinc-100">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {isOnSale && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
              Sale
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
