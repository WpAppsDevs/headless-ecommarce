'use client';

import { useState } from 'react';
import { Home, Package, MapPin, Settings, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { UserProfile } from '@/lib/api/checkout';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { Dashboard } from './Dashboard';
import { Orders } from './Orders';
import { Address } from './Address';
import { SettingsTab } from './Settings';
import { WishlistTab } from './Wishlist';

type Tab = 'dashboard' | 'orders' | 'address' | 'settings' | 'wishlist';

interface AccountLayoutProps {
  profile: UserProfile | null;
  orders: Order[];
  ordersMeta: OrdersMeta;
}

const MENU_ITEMS = [
  { id: 'dashboard' as Tab, label: 'Dashboard',   icon: Home     },
  { id: 'orders'    as Tab, label: 'Your Orders',  icon: Package  },
  { id: 'wishlist'  as Tab, label: 'Wishlist',     icon: Heart    },
  { id: 'address'   as Tab, label: 'My Address',   icon: MapPin   },
  { id: 'settings'  as Tab, label: 'Setting',      icon: Settings },
];

export function AccountLayout({ profile, orders, ordersMeta }: AccountLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wishlistCount = useWishlistStore((s) => s.count);

  // Support direct linking: /account?tab=wishlist
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'dashboard';
  const [activeTab, setActiveTab] = useState<Tab>(
    MENU_ITEMS.some((m) => m.id === initialTab) ? initialTab : 'dashboard',
  );
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Mobile tab bar */}
        <div className="mb-6 flex overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 lg:hidden">
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {label}
              {id === 'wishlist' && wishlistCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-wine px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Logout
          </button>
        </div>

        {/* Desktop two-column layout */}
        <div className="flex items-start gap-8">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="overflow-hidden rounded-xl border border-zinc-200 lg:sticky lg:top-24">
              {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex w-full items-center gap-3 border-b border-zinc-100 px-5 py-4 text-sm font-medium transition-colors last:border-b-0 ${
                    activeTab === id
                      ? 'bg-zinc-50 text-zinc-900'
                      : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                  {label}
                  {id === 'wishlist' && wishlistCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-wine px-1 text-[10px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                Logout
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">
            {activeTab === 'dashboard' && <Dashboard profile={profile} orders={orders} />}
            {activeTab === 'orders'    && <Orders orders={orders} meta={ordersMeta} />}
            {activeTab === 'wishlist'  && <WishlistTab />}
            {activeTab === 'address'   && <Address profile={profile} />}
            {activeTab === 'settings'  && <SettingsTab profile={profile} />}
          </main>
        </div>
      </div>
    </div>
  );
}
