'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDictionary } from '@/i18n/LocaleProvider';

/**
 * The class below cannot read the dictionary itself — error boundaries are the
 * one place a hook is unavailable — so the fallback is a function component.
 */
function ReviewsUnavailable() {
  const copy = useDictionary().reviews;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
      <p>{copy.boundaryError}</p>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface ReviewsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ReviewsErrorBoundary extends React.Component<
  ReviewsErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ReviewsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ReviewsErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ReviewsUnavailable />;
    }
    return this.props.children;
  }
}
