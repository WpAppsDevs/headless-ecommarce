'use client';

import { useState } from 'react';
import { Home, Package, MapPin, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/lib/api/checkout';
import type { Order, OrdersMeta } from '@/lib/api/orders';
import { Dashboard } from './Dashboard';
import { Orders } from './Orders';
import { Address } from './Address';
import { SettingsTab } from './Settings';

type Tab = 'dashboard' | 'orders' | 'address' | 'settings';

interface AccountLayoutProps {
  profile: UserProfile | null;
  orders: Order[];
  ordersMeta: OrdersMeta;
}

const MENU_ITEMS = [
  { id: 'dashboard' as Tab, label: 'Dashboard',   icon: Home     },
  { id: 'orders'    as Tab, label: 'Your Orders',  icon: Package  },
  { id: 'address'   as Tab, label: 'My Address',   icon: MapPin   },
  { id: 'settings'  as Tab, label: 'Setting',      icon: Settings },
];

export function AccountLayout({ profile, orders, ordersMeta }: AccountLayoutProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page header – centered */}
      <div className="border-b border-zinc-100 py-10 text-center">
        <nav className="mb-3 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <Link href="/" className="transition-colors hover:text-zinc-600">Home</Link>
          <span>›</span>
          <span className="text-zinc-600">My Account</span>
        </nav>
        <h1 className="text-4xl font-bold text-zinc-900">My Account</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
          Manage your profile, track orders, and easily update your personal details anytime,{' '}
          all in one convenient place.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Mobile tab bar */}
        <div className="mb-6 flex overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 lg:hidden">
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {label}
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
            {activeTab === 'address'   && <Address profile={profile} />}
            {activeTab === 'settings'  && <SettingsTab profile={profile} />}
          </main>
        </div>
      </div>
    </div>
  );
}
