import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';

export const metadata = {
  title: 'Reset Password',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Suspense required because ResetPasswordForm uses useSearchParams() */}
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-primary">
            Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
