'use client';

import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { StarRatingInput } from './StarRatingInput';
import { ReviewImageUpload } from './ReviewImageUpload';
import { submitReview, uploadReviewMedia } from '@/lib/api/reviews';
import { useReviewStore } from '@/stores/reviewStore';
import type { Review } from '@/lib/api/reviews';
import { useDictionary } from '@/i18n/LocaleProvider';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const buildSchema = (copy: { ratingRequired: string; contentTooShort: string }) =>
  z.object({
    rating: z.number().int().min(1, copy.ratingRequired).max(5),
    title: z.string().max(200).optional(),
    content: z.string().min(10, copy.contentTooShort).max(5000),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

// ---------------------------------------------------------------------------
// Error code → friendly message
// ---------------------------------------------------------------------------

function friendlyError(code: string, errors: ReturnType<typeof useDictionary>['reviews']['errors']): string {
  switch (code) {
    case 'already_reviewed':  return errors.alreadyReviewed;
    case 'duplicate_review':  return errors.duplicate;
    case 'rate_limited':      return errors.rateLimited;
    case 'invalid_product':   return errors.invalidProduct;
    case 'no_token':          return errors.noToken;
    default:                  return errors.generic;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ReviewFormProps {
  productId: number;
  productName: string;
  orderId?: number;
  onSuccess?: (review: Review) => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, productName, orderId, onSuccess, onCancel }: ReviewFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const copy = useDictionary().reviews;
  const schema = useMemo(() => buildSchema(copy.errors), [copy.errors]);
  const [uploading, setUploading] = useState(false);
  const markAsReviewed = useReviewStore((s) => s.markAsReviewed);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, title: '', content: '' },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch is used intentionally for the rating control
  const rating = watch('rating');

  const onRatingChange = useCallback(
    (val: number) => setValue('rating', val, { shouldValidate: true }),
    [setValue],
  );

  const onSubmit = async (values: FormValues) => {
    try {
      const review = await submitReview({
        product_id: productId,
        order_id: orderId,
        rating: values.rating,
        title: values.title || undefined,
        content: values.content,
      });

      // Upload images after the review is created
      if (imageFiles.length > 0) {
        setUploading(true);
        try {
          await uploadReviewMedia(review.id, imageFiles);
        } catch {
          toast.warning(copy.toasts.uploadWarning);
        } finally {
          setUploading(false);
        }
      }

      markAsReviewed(productId);
      toast.success(
        review.status === 'approved'
          ? copy.toasts.published
          : copy.toasts.pending,
      );
      onSuccess?.(review);
    } catch (err) {
      const code = err instanceof Error ? (err.message.match(/\[([^\]]+)\]/)?.[1] ?? '') : '';
      const apiCode = (err as { code?: string })?.code ?? code;
      toast.error(friendlyError(apiCode, copy.errors));
    }
  };

  const busy = isSubmitting || uploading;

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Product name */}
      <p className="text-sm text-zinc-500">
        {copy.form.writingFor.split('{name}')[0]}
        <span className="font-medium text-zinc-900">{productName}</span>
        {copy.form.writingFor.split('{name}')[1]}
      </p>

      {/* Rating */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          {copy.form.rating} <span className="text-red-500">*</span>
        </label>
        <StarRatingInput value={rating} onChange={onRatingChange} disabled={busy} />
        {errors.rating && (
          <p className="text-xs text-red-500">{errors.rating.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          {copy.form.titleLabel} <span className="text-zinc-400">{copy.form.optional}</span>
        </label>
        <input
          {...register('title')}
          disabled={busy}
          placeholder={copy.form.titlePlaceholder}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 disabled:opacity-50"
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          {copy.form.contentLabel} <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('content')}
          rows={5}
          disabled={busy}
          placeholder={copy.form.contentPlaceholder}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 disabled:opacity-50"
        />
        {errors.content && (
          <p className="text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          {copy.form.photos} <span className="text-zinc-400">{copy.form.optional}</span>
        </label>
        <ReviewImageUpload files={imageFiles} onChange={setImageFiles} disabled={busy} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            {copy.form.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={busy || rating === 0}
          className="flex items-center gap-2 rounded-lg bg-brand-wine px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? copy.form.uploading : isSubmitting ? copy.form.submitting : copy.form.submit}
        </button>
      </div>
    </form>
  );
}
