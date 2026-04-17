import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const dynamic = 'force-static';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Fill in the details below to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
