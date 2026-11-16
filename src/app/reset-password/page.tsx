import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  return { title: getDictionary(await getLocale()).auth.reset.metadataTitle };
}

export default async function ResetPasswordPage() {
  const copy = getDictionary(await getLocale()).auth.reset;
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 font-geist">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>

        {/* Suspense required because ResetPasswordForm uses useSearchParams() */}
        <Suspense
          fallback={<div className="text-center text-sm text-muted-foreground">{copy.loading}</div>}
        >
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-primary">
            {copy.backToSignIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
