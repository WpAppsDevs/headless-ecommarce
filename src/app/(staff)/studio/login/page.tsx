import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StaffLoginForm } from '@/components/staff/StaffLoginForm';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocale } from '@/i18n/server';

export async function generateMetadata() {
  const copy = getDictionary(await getLocale()).staff.login;

  return { title: copy.metadataTitle, description: copy.description };
}

export default async function StudioLoginPage() {
  const copy = getDictionary(await getLocale()).staff.login;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 font-geist">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <StaffLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
