'use client';

import { useEffect, useRef } from 'react';

/**
 * Focus handling for a plain overlay dialog.
 *
 * An overlay built from a `<div>` gets none of what a native `<dialog>` gives
 * for free, and the gaps are invisible until someone uses a keyboard: focus
 * stays behind the overlay, Tab walks into the page underneath, and closing
 * leaves focus nowhere. This hook closes those three:
 *
 * - focus moves to the panel on open,
 * - Tab and Shift+Tab cycle inside it,
 * - Escape closes, and focus returns to whatever opened it.
 *
 * Attach the returned ref to the panel itself (not the backdrop) and give the
 * panel `role="dialog"` plus `aria-modal="true"`; the hook handles behaviour,
 * not semantics, so the markup stays readable in the component.
 */
export function useDialogFocus<T extends HTMLElement>(onClose: () => void, active = true) {
  const ref = useRef<T>(null);
  // Kept in a ref so a new `onClose` identity does not re-run the effect and
  // move focus on every parent render. Written in an effect, never during render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const panel = ref.current;
    if (!panel) return;

    const opener = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

    (focusables()[0] ?? panel).focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      opener?.focus?.();
    };
  }, [active]);

  return ref;
}
