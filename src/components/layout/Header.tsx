'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, User, Heart } from 'lucide-react';
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
  { href: '/products', label: 'Shop' },
];

// ── Search overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = inputRef.current?.value.trim();
    onClose();
    router.push(val ? `/products?search=${encodeURIComponent(val)}` : '/products');
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center bg-white px-4 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit} className="flex w-full items-center gap-3">
        <Search className="h-5 w-5 shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search for products, categories…"
          className="flex-1 bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 outline-none"
          aria-label="Search"
        />
        <button type="button" onClick={onClose} aria-label="Close search" className="p-1 text-zinc-500 hover:text-zinc-900">
          <X className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

// ── Nav links ────────────────────────────────────────────────────────────────
function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]));
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={cn(
              'relative text-sm font-medium transition-colors',
              active
                ? 'text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900',
              // animated underline
              'after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-zinc-900 after:transition-transform hover:after:scale-x-100',
              active && 'after:scale-x-100',
            )}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

// ── Auth links ───────────────────────────────────────────────────────────────
function UserMenu({ onClose }: { onClose?: () => void }) {
  const { isAuthenticated, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-2">
        <Link href="/account" onClick={onClose}
          className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">
          My Account
        </Link>
        <Link href="/account" onClick={onClose}
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
          Orders
        </Link>
        <button onClick={async () => { await logout(); onClose?.(); }}
          className="text-left text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Link href="/login" onClick={onClose}
        className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
        Sign In
      </Link>
      <Link href="/register" onClick={onClose}
        className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
        Create Account
      </Link>
    </div>
  );
}

// ── Main Header ──────────────────────────────────────────────────────────────
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.length);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Search overlay (full-width) */}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

        {/* ── Logo ── */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-black tracking-tight text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-black text-white">
            {config.siteName.charAt(0)}
          </span>
          {config.siteName}
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
          <NavLinks />
        </nav>

        {/* ── Desktop Right Icons ── */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          {/* Wishlist placeholder */}
          <button
            aria-label="Wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Heart className="h-[18px] w-[18px]" />
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Cart${itemCount > 0 ? ` — ${itemCount} items` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* User / Account */}
          <div className="group relative ml-1">
            <button
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <User className="h-[18px] w-[18px]" />
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 hidden w-44 rounded-xl border border-zinc-100 bg-white p-3 shadow-xl group-hover:block">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* ── Mobile: search + cart + hamburger ── */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Cart${itemCount > 0 ? ` — ${itemCount} items` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="text-left text-base font-black">{config.siteName}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-6 py-6">
                <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
                  <NavLinks onClick={() => setMobileOpen(false)} />
                </nav>
                <hr className="border-zinc-100" />
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Account</p>
                  <UserMenu onClose={() => setMobileOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


