import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 gap-6">
      <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-40" />
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
        <p className="text-xl font-semibold">Page not found</p>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Sorry, we couldn&apos;t find what you were looking for.
        </p>
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}
      >
        Back to Home
      </Link>
    </div>
  );
}
