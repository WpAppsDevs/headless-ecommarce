'use client';

import type { UserProfile } from '@/lib/api/checkout';

interface AddressProps {
  profile: UserProfile | null;
}

type DisplayAddress = Partial<{
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}> | null | undefined;

function AddressBlock({ title, address }: { title: string; address: DisplayAddress }) {
  const isEmpty =
    !address ||
    (!address.first_name &&
      !address.last_name &&
      !address.address_1 &&
      !address.city &&
      !address.country);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
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
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">My Address</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Addresses are saved with your orders. Contact support to change your
          default billing or shipping address.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <AddressBlock title="Billing Address" address={profile?.billing} />
        <AddressBlock title="Shipping Address" address={profile?.shipping} />
      </div>
    </div>
  );
}
