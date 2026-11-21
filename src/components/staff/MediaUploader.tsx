'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/i18n/LocaleProvider';
import {
  deleteStaffImage,
  updateStaffImageAlt,
  uploadStaffImage,
  type StaffImage,
} from '@/lib/api/staff-products';

interface MediaUploaderProps {
  images: StaffImage[];
  onChange: (images: StaffImage[]) => void;
  max: number;
  maxFileMb: number;
  label: string;
  hint?: string;
  disabled?: boolean;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload one or more product images and describe them.
 *
 * Upload is immediate — that is what makes the two-step flow worth it: a
 * rejected file is reported before the product is saved, and a preview is real.
 * An image added here and then removed is deleted from the library when no
 * product uses it yet.
 */
export function MediaUploader({
  images,
  onChange,
  max,
  maxFileMb,
  label,
  hint,
  disabled,
}: MediaUploaderProps) {
  const copy = useDictionary().staff.media;
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const remaining = Math.max(0, max - images.length);

  const handleFiles = async (files: FileList | null) => {
    if (!files || remaining < 1) return;

    setBusy(true);
    const next = [...images];

    for (const file of Array.from(files).slice(0, remaining)) {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(copy.invalidType);
        continue;
      }

      if (file.size > maxFileMb * 1024 * 1024) {
        toast.error(copy.tooLarge);
        continue;
      }

      try {
        next.push(await uploadStaffImage(file));
        onChange([...next]);
      } catch {
        toast.error(copy.uploadFailed);
      }
    }

    setBusy(false);

    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = async (image: StaffImage) => {
    onChange(images.filter((item) => item.id !== image.id));

    try {
      await deleteStaffImage(image.id);
    } catch {
      // The orphan sweep removes it later; a used image stays, which is right.
    }
  };

  const saveAlt = async (image: StaffImage, alt: string) => {
    if (alt === image.alt) return;

    try {
      const updated = await updateStaffImageAlt(image.id, alt);
      onChange(images.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      toast.error(copy.altFailed);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-brand-text">{label}</span>
        <span className="text-xs text-brand-text-muted">
          {copy.counter} {images.length}/{max}
        </span>
      </div>

      {hint && <p className="text-xs text-brand-text-muted">{hint}</p>}

      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <figure
            key={image.id}
            className="w-[136px] space-y-1.5 rounded-lg border border-brand-border bg-white p-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-brand-bg">
              {image.url ? (
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="136px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <ImagePlus className="absolute inset-0 m-auto h-6 w-6 text-brand-text-muted" />
              )}
              <button
                type="button"
                onClick={() => void remove(image)}
                aria-label={copy.remove}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-brand-text shadow-sm hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <label className="block">
              <span className="sr-only">
                {copy.altLabel} — {image.alt || copy.altEmpty}
              </span>
              <input
                type="text"
                defaultValue={image.alt}
                placeholder={copy.altPlaceholder}
                aria-label={copy.altLabel}
                onBlur={(event) => void saveAlt(image, event.target.value.trim())}
                className="w-full rounded border border-brand-border px-2 py-1 text-xs text-brand-text"
              />
            </label>
          </figure>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleFiles(event.dataTransfer.files);
            }}
            className={cn(
              'flex h-[136px] w-[136px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brand-border bg-brand-bg text-xs text-brand-text-muted',
              'hover:border-brand-accent-strong hover:text-brand-accent-strong disabled:opacity-60',
              dragging && 'border-brand-accent-strong text-brand-accent-strong',
            )}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{busy ? copy.uploading : copy.choose}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple={max > 1}
        hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {images.length > 0 && max > 1 && (
        <p className="flex items-center gap-1 text-xs text-brand-text-muted">
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          {copy.removeHint}
        </p>
      )}
    </div>
  );
}
