'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useDictionary } from '@/i18n/LocaleProvider';
import { interpolate } from '@/i18n/interpolate';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled = false }: StarRatingInputProps) {
  const copy = useDictionary().reviews;
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1" role="radiogroup" aria-label={copy.starGroupAria}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={interpolate(star > 1 ? copy.starAriaPlural : copy.starAria, {
              star,
              label: copy.starLabels[star - 1],
            })}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              className="h-7 w-7"
              fill={star <= active ? '#f59e0b' : 'none'}
              stroke={star <= active ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-sm font-medium text-amber-600">{copy.starLabels[active - 1]}</span>
      )}
    </div>
  );
}
