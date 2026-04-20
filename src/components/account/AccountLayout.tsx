'use client';

import { useState } from 'react';
import { Home, Package, MapPin, Settings, LogOut } from 'lucide-react';
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
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
  { id: 'orders' as Tab, label: 'Your Orders', icon: Package },
  { id: 'address' as Tab, label: 'My Address', icon: MapPin },
  { id: 'settings' as Tab, label: 'Settings', icon: Settings },
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">My Account</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your profile and orders</p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 lg:sticky lg:top-20">
              {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </div>
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-zinc-200 my-2" />

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <Dashboard profile={profile} orders={orders} />
            )}
            {activeTab === 'orders' && (
              <Orders orders={orders} meta={ordersMeta} />
            )}
            {activeTab === 'address' && (
              <Address profile={profile} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab profile={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
