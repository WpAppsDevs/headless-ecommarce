import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).auth.forgot;

  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function ForgotPasswordPage() {
  const copy = getDictionary(await getLocale()).auth.forgot;
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 font-geist">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-muted-foreground">
          {copy.remember}{' '}
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-primary">
            {copy.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
