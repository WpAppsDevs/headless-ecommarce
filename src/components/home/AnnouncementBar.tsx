'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';

const MESSAGES = [
  '🎉 Midseason Sale: 20% Off — Auto Applied at Checkout — Limited Time Only',
  '🚚 Free Shipping on Orders Over $50 — Shop Now',
  '🔥 New Arrivals Just Dropped — Discover the Latest Collection',
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
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-900 text-white text-sm py-2.5 px-4 text-center overflow-hidden">
      <span
        className="inline-flex items-center gap-2 transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <Tag className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
        {MESSAGES[index]}
      </span>
    </div>
  );
}
