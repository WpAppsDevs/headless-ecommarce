import Link from 'next/link';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.21 8.21 0 004.79 1.53V6.83a4.85 4.85 0 01-1.02-.14z" />
    </svg>
  );
}

export function AnnouncementBar() {
  return (
    <div className="bg-brand-topbar text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left spacer (desktop) */}
        <div className="hidden w-20 lg:block" />

        {/* Center: 3 items with pipe separators */}
        <div className="flex flex-1 items-center justify-center gap-2 text-[12px] font-medium sm:gap-4 lg:gap-6">
          <span className="hidden sm:inline">Pre-Order from Pakistan 🇵🇰</span>
          <span className="inline sm:hidden text-[11px]">Pre-Order 🇵🇰| 15-25 Days | Original</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span className="hidden sm:inline">Delivery in 15-25 Days</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span className="hidden sm:inline">Authentic Pakistani Collections</span>
        </div>

        {/* Right: Social icons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
            className="opacity-80 transition hover:opacity-100">
            <FacebookIcon />
          </Link>
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
            className="opacity-80 transition hover:opacity-100">
            <InstagramIcon />
          </Link>
          <Link href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
            className="opacity-80 transition hover:opacity-100">
            <TikTokIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
