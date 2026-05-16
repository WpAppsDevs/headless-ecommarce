'use client';

import { useCallback, useRef } from 'react';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ReviewImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Only JPEG, PNG, GIF, or WebP images are allowed.';
  if (file.size > MAX_SIZE_BYTES) return `File must be under ${MAX_SIZE_MB} MB.`;
  return null;
}

export function ReviewImageUpload({ files, onChange, disabled = false }: ReviewImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const errors: string[] = [];
      const valid: File[] = [];

      for (const file of Array.from(incoming)) {
        const err = validateFile(file);
        if (err) errors.push(`${file.name}: ${err}`);
        else valid.push(file);
      }

      const combined = [...files, ...valid].slice(0, MAX_FILES);
      onChange(combined);

      if (errors.length > 0) alert(errors.join('\n'));
    },
    [files, onChange],
  );

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {files.length < MAX_FILES && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center transition hover:border-zinc-400 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <ImagePlus className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">
            Drop images here or <span className="font-medium text-zinc-700">click to upload</span>
          </p>
          <p className="text-xs text-zinc-400">
            Up to {MAX_FILES} images · Max {MAX_SIZE_MB} MB each · JPEG, PNG, GIF, WebP
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED.join(',')}
        className="hidden"
        disabled={disabled}
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-200">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                fill
                className="object-cover"
                unoptimized
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length === MAX_FILES && (
        <p className="flex items-center gap-1.5 text-xs text-amber-600">
          <AlertCircle className="h-3.5 w-3.5" />
          Maximum {MAX_FILES} images reached.
        </p>
      )}
    </div>
  );
}
