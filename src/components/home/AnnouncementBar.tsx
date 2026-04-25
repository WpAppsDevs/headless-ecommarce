'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';

const MESSAGES = [
  '🎉 Eid Collection Now Live — Premium Pakistani Dresses at Special Prices',
  '🚚 Free Delivery on Orders Over ৳2,500 — Ready Stock Ships in 2–5 Days',
  '📦 Pre-Order Now Open — Imported Direct from Pakistan in 10–15 Days',
  '🛍️ Wholesale & Catalog Orders Available — Contact Us for Bulk Pricing',
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-brand-dark text-white text-sm py-2.5 px-4 text-center overflow-hidden">
      <span
        className="inline-flex items-center gap-2 transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <Tag className="h-3.5 w-3.5 text-brand-accent shrink-0" />
        {MESSAGES[index]}
      </span>
    </div>
  );
}
