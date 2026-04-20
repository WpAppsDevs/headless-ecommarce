'use client';

import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-6 py-5">
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-1 text-4xl font-bold text-zinc-900">{value}</p>
      </div>
      <Icon className="h-9 w-9 shrink-0 text-zinc-400" strokeWidth={1.25} />
    </div>
  );
}
