'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface OrderFilterOption {
  id: string;
  label: string;
}

interface OrderFilterMenuProps {
  /** Describes the control for screen readers. */
  label: string;
  value: string;
  options: OrderFilterOption[];
  onChange: (id: string) => void;
}

/**
 * The phone-sized order filter: one field, with the six statuses in a panel
 * that opens directly beneath it.
 *
 * A native `<select>` was the obvious first choice, but the OS picker it raised
 * is not ours to style — it covered the orders it was filtering and only ever
 * showed the current status. This keeps the six statuses attached to the field,
 * in the site's own type and colour, so the choice reads as part of the page.
 */
export function OrderFilterMenu({ label, value, options, onChange }: OrderFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls="orders-status-options"
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-brand-border bg-white px-4 text-left text-sm font-medium text-brand-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent-strong"
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-brand-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id="orders-status-options"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-brand-border bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(15,17,21,0.35)]"
        >
          <p className="sr-only">{label}</p>
          <ul>
            {options.map((option) => {
              const active = option.id === value;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    aria-pressed={active}
                    className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 text-sm transition-colors ${
                      active
                        ? 'bg-brand-accent-light font-semibold text-brand-accent-strong'
                        : 'font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text'
                    }`}
                  >
                    {option.label}
                    {active && <Check className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
