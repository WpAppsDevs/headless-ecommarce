'use client';

import { UserProfile } from '@/lib/api/checkout';

interface AddressProps {
  profile: UserProfile | null;
}

function AddressBlock({ title, address }: { title: string; address: any }) {
  const isEmpty =
    !address ||
    (!address.first_name &&
      !address.last_name &&
      !address.address_1 &&
      !address.city &&
      !address.country);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        <button className="text-sm font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
          Edit
        </button>
      </div>

      {isEmpty ? (
        <p className="py-8 text-center text-sm text-zinc-500">Not set</p>
      ) : (
        <address className="not-italic space-y-1 text-sm leading-relaxed text-zinc-700">
          {address.first_name && address.last_name && (
            <div className="font-medium">
              {address.first_name} {address.last_name}
            </div>
          )}
          {address.company && <div>{address.company}</div>}
          {address.address_1 && <div>{address.address_1}</div>}
          {address.address_2 && <div>{address.address_2}</div>}
          <div>
            {address.city && address.city}
            {address.state && (
              <>
                {address.city && ', '}
                {address.state}
              </>
            )}
            {address.postcode && ` ${address.postcode}`}
          </div>
          {address.country && <div>{address.country}</div>}
          {address.email && <div className="pt-2">{address.email}</div>}
          {address.phone && <div>{address.phone}</div>}
        </address>
      )}
    </div>
  );
}

export function Address({ profile }: AddressProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">My Address</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <AddressBlock title="Billing Address" address={profile?.billing} />
        <AddressBlock title="Shipping Address" address={profile?.shipping} />
      </div>
    </div>
  );
}
