'use client';

interface StatsCardProps {
  label: string;
  value: number;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      <p className="text-sm font-medium text-zinc-600">{label}</p>
      <p className="mt-3 text-4xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}
