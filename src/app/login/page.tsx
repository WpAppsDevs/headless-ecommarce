import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).auth.login;

  return { title: copy.metadataTitle, description: copy.description };
}

export default async function LoginPage() {
  const copy = getDictionary(await getLocale()).auth.login;
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 font-geist">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Suspense required because LoginForm uses useSearchParams() */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
