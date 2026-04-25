'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/products?type=ready-stock', label: 'READY STOCK' },
  { href: '/products?type=pre-order', label: 'PRE-ORDER' },
  { href: '/products?type=catalog', label: 'CATALOG / WHOLESALE' },
  { href: '/products?cat=women', label: 'WOMEN' },
  { href: '/products?cat=men', label: 'MEN' },
  { href: '/products?cat=kids', label: 'KIDS' },
  { href: '/contact', label: 'CONTACT' },
];

// ── Libaas Floral Logo ───────────────────────────────────────────────────────
function LibaasLogo() {
  return (
    <Link href="/" className="flex shrink-0 flex-col leading-none" aria-label="Libaas — Pakistani Collection">
      <div className="flex items-end gap-1">
        <span className="font-serif text-[2rem] font-bold italic leading-none tracking-tight text-brand-text">
          Libaas
        </span>
        {/* Small floral decoration */}
        <svg viewBox="0 0 28 28" className="mb-0.5 h-6 w-6 text-brand-accent" fill="currentColor" aria-hidden="true">
          <path d="M14 2C14 2 10 7 10 11C10 13.2 11.8 15 14 15C16.2 15 18 13.2 18 11C18 7 14 2 14 2Z" opacity="0.8"/>
          <path d="M6 8C6 8 4 13 6 16C7.1 17.6 9 18.3 10.7 17.7C12.4 17.1 13.2 15.2 12.6 13.5C11.4 10.2 6 8 6 8Z" opacity="0.6"/>
          <path d="M22 8C22 8 17 10.2 15.9 13.5C15.3 15.2 16.1 17.1 17.8 17.7C19.5 18.3 21.4 17.6 22.5 16C24.5 13 22 8 22 8Z" opacity="0.6"/>
          <path d="M14 15C14 15 9 17 8 20.5C7.5 22.3 8.8 24.1 10.7 24.4C12.5 24.7 14.2 23.4 14.5 21.6C14.8 19.5 14 15 14 15Z" opacity="0.5"/>
          <path d="M14 15C14 15 19 17 20 20.5C20.5 22.3 19.2 24.1 17.3 24.4C15.5 24.7 13.8 23.4 13.5 21.6C13.2 19.5 14 15 14 15Z" opacity="0.5"/>
          <circle cx="14" cy="15" r="2.5" />
        </svg>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-brand-text-muted">
        Pakistani Collection
      </span>
    </Link>
  );
}

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

// ── Desktop nav links ────────────────────────────────────────────────────────
function DesktopNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'text-[11px] font-semibold tracking-[0.08em] transition-colors whitespace-nowrap',
              active ? 'text-brand-wine' : 'text-zinc-700 hover:text-brand-wine',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Mobile nav links ─────────────────────────────────────────────────────────
function MobileNavLinks({ onClick }: { onClick?: () => void }) {
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
              'text-sm font-medium transition-colors',
              active ? 'text-brand-wine' : 'text-zinc-700 hover:text-brand-wine',
            )}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

// ── Auth dropdown content ────────────────────────────────────────────────────
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
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Search overlay (full-width) */}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

        {/* ── Logo ── */}
        <LibaasLogo />

        {/* ── Desktop Nav ── */}
        <DesktopNavLinks />

        {/* ── Desktop Right Icons ── */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Search className="h-[19px] w-[19px]" strokeWidth={1.8} />
          </button>

          {/* Account */}
          <div className="group relative">
            <button
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <User className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 hidden w-44 rounded-xl border border-zinc-100 bg-white p-3 shadow-xl group-hover:block">
              <UserMenu />
            </div>
          </div>

          {/* Cart */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Cart — ${itemCount} items`}
            className="relative ml-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ShoppingCart className="h-[19px] w-[19px]" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-wine px-0.5 text-[10px] font-bold text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </button>
        </div>

        {/* ── Mobile: search + cart + hamburger ── */}
        <div className="flex xl:hidden items-center gap-0.5">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50"
          >
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Cart — ${itemCount} items`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-wine px-0.5 text-[10px] font-bold text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="text-left">
                  <span className="font-serif text-xl font-bold italic text-brand-text">Libaas</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-6 py-6">
                <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
                  <MobileNavLinks onClick={() => setMobileOpen(false)} />
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
