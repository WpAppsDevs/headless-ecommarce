'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
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
  const [zoomOpen, setZoomOpen] = useState(false);
  // Track which images have failed to load so we can fall back to placeholder
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);

  const validImages = Array.isArray(images) ? images : [];
  const total = validImages.length;
  const activeSrc =
    failedIndices.has(active) || !validImages[active]?.src
      ? PLACEHOLDER
      : validImages[active].src;
  const activeAlt = validImages[active]?.alt || name;

  function handleError(index: number) {
    setFailedIndices((prev) => new Set(prev).add(index));
  }

  function goPrev() {
    if (total > 1) setActive((i) => (i - 1 + total) % total);
  }

  function goNext() {
    if (total > 1) setActive((i) => (i + 1) % total);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = delta - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start lg:gap-3">
      {/* Thumbnail strip — horizontal on mobile, vertical on desktop */}
      {total > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[340px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
          {validImages.map((img, i) => {
            const thumbSrc = failedIndices.has(i) || !img.src ? PLACEHOLDER : img.src;
            return (
              <button
                key={img.id ?? i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={img.alt || `Image ${i + 1}`}
                aria-current={active === i}
                className={cn(
                  'relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[6px] border-2 transition-all',
                  active === i
                    ? 'border-[#9E2F45] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                <Image
                  src={thumbSrc}
                  alt={img.alt || name}
                  fill
                  className="object-cover"
                  sizes="76px"
                  onError={() => handleError(i)}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main image */}
      <div
        className="group relative aspect-[6/7] min-w-0 flex-1 overflow-hidden rounded-[12px] bg-[#F1ECE7]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={activeSrc}
          alt={activeAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          onError={() => handleError(active)}
        />

        {/* Sale badge (kept from original, positioned top-left) */}
        {isOnSale && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-[#9E2F45] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Sale
            </span>
          </div>
        )}

        {/* Image counter */}
        {total > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {active + 1} / {total}
          </div>
        )}

        {/* Prev / Next */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1F2A3C] shadow-sm transition-opacity hover:bg-[#F6E4E4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45]"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1F2A3C] shadow-sm transition-opacity hover:bg-[#F6E4E4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45]"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Zoom */}
        {activeSrc !== PLACEHOLDER && (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Zoom image"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1F2A3C] shadow-sm transition-opacity hover:bg-[#F6E4E4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E2F45]"
          >
            <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Simple zoom modal (no lightbox library exists in this project) */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close image preview"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1F2A3C] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSrc}
            alt={activeAlt}
            className="max-h-[85vh] max-w-[90vw] rounded-[12px] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
