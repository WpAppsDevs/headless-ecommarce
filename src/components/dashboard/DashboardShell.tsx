'use client';

import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

export interface DashboardMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** A count shown next to the label; omitted when there is nothing to count. */
  badge?: string;
}

interface DashboardIdentity {
  initials: string;
  name: string;
  email: string;
  /** Shown where the email is missing. */
  emptyEmail: string;
  /** The line under the email: what this surface is, and the way back to the shop. */
  trail: ReactNode;
}

interface DashboardShellProps {
  /** Announced as the page heading and used by the identity trail. */
  surface: string;
  navLabel: string;
  identity: DashboardIdentity;
  menu: DashboardMenuItem[];
  activeId: string;
  onSelect: (id: string) => void;
  logoutLabel: string;
  onLogout: () => void;
  children: ReactNode;
}

/**
 * The one dashboard canvas: identity, navigation, and a content well.
 *
 * The account dashboard and the staff dashboard share it so a change to the
 * rail, the mobile tab grid or the tinted canvas lands on both surfaces. What
 * differs is what each passes in — menu, labels, where logout goes.
 */
export function DashboardShell({
  surface,
  navLabel,
  identity,
  menu,
  activeId,
  onSelect,
  logoutLabel,
  onLogout,
  children,
}: DashboardShellProps) {
  return (
    <div className="bg-brand-bg font-geist">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <h1 className="sr-only">{surface}</h1>

        {/* The canvas: one tinted surface under identity, nav and content. */}
        <div className="rounded-[26px] bg-brand-accent-light p-3 sm:p-4 lg:p-5">
          {/* Mobile: identity band, then the tabs. The row sticks below the site
              header so switching stays available while scrolling. */}
          <div className="lg:hidden">
            <div className="relative rounded-2xl bg-brand-accent-strong px-4 pb-5 pt-6 text-center">
              <button
                type="button"
                onClick={onLogout}
                aria-label={logoutLabel}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-lg font-bold text-white ring-2 ring-white/20"
              >
                {identity.initials}
              </span>
              <p className="mt-2.5 truncate text-[13px] font-bold uppercase text-white">
                {identity.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-white/65">
                {identity.email || identity.emptyEmail}
              </p>
              {identity.trail}
            </div>

            <div
              className="sticky top-24 z-30 mt-2 grid gap-1.5 rounded-xl border border-brand-border bg-white p-1.5"
              style={{ gridTemplateColumns: `repeat(${menu.length}, minmax(0, 1fr))` }}
            >
              {menu.map(({ id, icon: Icon, label, badge }) => {
                const active = activeId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors ${
                      active
                        ? 'bg-brand-accent-strong text-white'
                        : 'bg-brand-bg text-brand-text-muted hover:bg-brand-accent-light hover:text-brand-accent-strong'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                    <span className="text-center">{label}</span>
                    {badge && (
                      <span
                        className={`absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                          active ? 'bg-white/25 text-white' : 'bg-brand-accent-strong text-white'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: rail and content share one height, inside the canvas. */}
          <div className="mt-3 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:gap-5">
            <aside className="hidden w-60 shrink-0 self-stretch lg:block">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white">
                <div className="bg-brand-accent-strong px-4 pb-6 pt-7 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white ring-2 ring-white/20"
                  >
                    {identity.initials}
                  </span>
                  <p className="mt-3 truncate text-[13px] font-bold uppercase text-white">
                    {identity.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/65">
                    {identity.email || identity.emptyEmail}
                  </p>
                  {identity.trail}
                </div>

                <nav aria-label={navLabel} className="flex-1 space-y-2 p-2.5">
                  {menu.map(({ id, icon: Icon, label, badge }) => {
                    const active = activeId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onSelect(id)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                          active
                            ? 'bg-brand-accent-strong font-semibold text-white shadow-sm'
                            : 'bg-brand-bg font-medium text-brand-text-muted hover:bg-brand-accent-light hover:text-brand-accent-strong'
                        }`}
                      >
                        <Icon
                          className="h-[18px] w-[18px] shrink-0"
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                        {label}
                        {badge && (
                          <span
                            className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                              active
                                ? 'bg-white text-brand-accent-strong'
                                : 'bg-brand-accent-strong text-white'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="border-t border-brand-border p-2.5">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-brand-text-muted transition-colors hover:bg-brand-bg hover:text-brand-text"
                  >
                    <LogOut
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    {logoutLabel}
                  </button>
                </div>
              </div>
            </aside>

            <div className="min-h-[480px] min-w-0 flex-1 lg:min-h-[640px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
