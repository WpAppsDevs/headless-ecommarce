'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TrackingFormProps {
  onSubmit: (email: string, orderId?: number) => void;
  isLoading: boolean;
}

export function TrackingForm({ onSubmit, isLoading }: TrackingFormProps) {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    const parsedOrderId = orderId.trim() ? parseInt(orderId, 10) : undefined;
    onSubmit(email.trim(), parsedOrderId);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          disabled={isLoading}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
        />
        {emailError && (
          <p id="email-error" className="text-sm text-red-500 mt-1">{emailError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderId">Order Number (optional)</Label>
        <Input
          id="orderId"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 1234"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading || !email.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Tracking...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Track Order
          </>
        )}
      </Button>
    </form>
  );
}
