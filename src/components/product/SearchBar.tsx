'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = ref.current?.value.trim();
    if (val) {
      router.push(`/products?search=${encodeURIComponent(val)}`);
    } else {
      router.push('/products');
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={ref}
        type="search"
        placeholder="Search products…"
        defaultValue={defaultValue}
        className="pl-9"
      />
    </form>
  );
}
