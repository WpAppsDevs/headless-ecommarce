import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).auth.register;

  return { title: copy.metadataTitle, description: copy.description };
}

export default async function RegisterPage() {
  const copy = getDictionary(await getLocale()).auth.register;
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 font-geist">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
