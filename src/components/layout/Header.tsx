'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, User, Heart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/products?tag=ready-stock', label: 'READY STOCK' },
  { href: '/products?tag=pre-order', label: 'PRE-ORDER' },
  { href: '/products?tag=catalog', label: 'CATALOG / WHOLESALE' },
  { href: '/contact', label: 'CONTACT' },
];

// ── Site Logo ───────────────────────────────────────────────────────────────
function SiteLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="Najifa's Shop — Pakistani Collection">
      <Image
        src="/images/Najifa's Shop Logo.png"
        alt="Najifa's Shop"
        width={140}
        height={48}
        className="h-12 w-auto object-contain"
        priority
      />
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
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.items.length);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const wishlistCount = useWishlistStore((s) => s.count);

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Search overlay (full-width) */}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

        {/* ── Logo ── */}
        <SiteLogo />

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
          <div className="relative" ref={accountRef}>
            <button
              aria-label="Account"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <User className="h-[19px] w-[19px]" strokeWidth={1.8} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-100 bg-white p-3 shadow-xl z-50">
                <UserMenu onClose={() => setAccountOpen(false)} />
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            href="/account?tab=wishlist"
            aria-label={`Wishlist — ${wishlistCount} items`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Heart className="h-[19px] w-[19px]" strokeWidth={1.8} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-wine px-0.5 text-[10px] font-bold text-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

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

          <Link
            href="/account?tab=wishlist"
            aria-label={`Wishlist — ${wishlistCount} items`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50"
          >
            <Heart className="h-5 w-5" strokeWidth={1.8} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-wine px-0.5 text-[10px] font-bold text-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

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
                  <Image
                    src="/images/Najifa's Shop Logo.png"
                    alt="Najifa's Shop"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-6 py-6">
                <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
                  <MobileNavLinks onClick={() => setMobileOpen(false)} />
                </nav>
                <hr className="border-zinc-100" />
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">My Lists</p>
                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
                  >
                    <Heart className="h-4 w-4 text-brand-wine" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </div>
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
