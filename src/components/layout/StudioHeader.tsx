import { SiteLogo } from '@/components/layout/SiteLogo';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';

/**
 * The studio's header: the shop's wordmark and the language switch.
 *
 * Deliberately stripped — no menu, search, cart, wishlist or account icons,
 * because those are storefront jobs and the dashboard has its own navigation.
 * The footer below the dashboard stays the shop's.
 */
export function StudioHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <SiteLogo />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
