'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === href ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  );
}

function AuthLinks({ onClick }: { onClick?: () => void }) {
  const { isAuthenticated, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <>
        <Link
          href="/account"
          onClick={onClick}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Account
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await logout();
            onClick?.();
          }}
        >
          Logout
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href="/login" onClick={onClick} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Login
      </Link>
      <Link href="/register" onClick={onClick} className={cn(buttonVariants({ size: 'sm' }))}>
        Register
      </Link>
    </>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.length);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          {config.siteName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        {/* Desktop right section */}
        <div className="hidden md:flex items-center gap-3">
          <AuthLinks />
          <CartButton itemCount={itemCount} onOpen={() => setCartDrawerOpen(true)} />
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <CartButton itemCount={itemCount} onOpen={() => setCartDrawerOpen(true)} />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{config.siteName}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                <NavLinks onClick={() => setMobileOpen(false)} />
                <hr className="border-border" />
                <AuthLinks onClick={() => setMobileOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function CartButton({ itemCount, onOpen }: { itemCount: number; onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
      className="relative"
      onClick={onOpen}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
}
