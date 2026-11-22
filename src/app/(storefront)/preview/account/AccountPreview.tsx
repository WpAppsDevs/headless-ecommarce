'use client';

import { Suspense } from 'react';
import { AccountLayout } from '@/components/account/AccountLayout';
import type { UserProfile } from '@/lib/api/checkout';
import type { Order, OrderLineItem } from '@/lib/api/orders';

/**
 * Sample data for `/preview/account`. Product names stay English on purpose —
 * that is what WordPress sends — so the fixture reads like the real dashboard
 * rather than like a translated mock.
 */
const profile: UserProfile = {
  id: 1,
  email: 'md@example.com',
  display_name: 'Md Rahman',
  first_name: 'Md',
  last_name: 'Rahman',
  roles: ['customer'],
  billing: {
    first_name: 'Md',
    last_name: 'Rahman',
    email: 'md@example.com',
    phone: '01700000000',
    address_1: 'House 12, Road 5, Dhanmondi',
    address_2: '',
    city: 'Dhaka',
    state: 'Dhaka',
    postcode: '1205',
    country: 'BD',
    company: '',
  },
  shipping: {
    first_name: 'Md',
    last_name: 'Rahman',
    address_1: 'House 12, Road 5, Dhanmondi',
    address_2: '',
    city: 'Dhaka',
    state: 'Dhaka',
    postcode: '1205',
    country: 'BD',
  },
};

function lineItem(
  id: number,
  name: string,
  image: string,
  total: string,
  quantity = 1,
): OrderLineItem {
  return {
    id,
    name,
    product_id: id,
    variation_id: 0,
    quantity,
    subtotal: total,
    total,
    sku: '',
    price: Number(total) / quantity,
    image,
  };
}

const orders: Order[] = [
  {
    id: 311,
    status: 'processing',
    currency: 'BDT',
    total: '2850.00',
    date_created: '2026-11-17T10:00:00',
    line_items: [
      lineItem(1, 'GULL JEE - JHEEI VOL 1 - A2', '/images/category-grid/catalog-1.jpg', '2850.00'),
    ],
  },
  {
    id: 307,
    status: 'completed',
    currency: 'BDT',
    total: '14600.00',
    date_created: '2026-11-08T10:00:00',
    line_items: [
      lineItem(2, 'Meeral - Yumna', '/images/category-grid/catalog-2.jpg', '11600.00'),
      lineItem(3, 'Meeral - Yumna Dupatta', '/images/category-grid/catalog-3.jpg', '3000.00'),
    ],
  },
  {
    id: 283,
    status: 'pending',
    currency: 'BDT',
    total: '2850.00',
    date_created: '2026-07-05T10:00:00',
    line_items: [
      lineItem(4, 'GULL JEE - JHEEI VOL 1 - A10', '/images/category-grid/catalog-1.jpg', '2850.00'),
    ],
  },
];

export function AccountPreview() {
  return (
    <Suspense>
      <AccountLayout profile={profile} orders={orders} />
    </Suspense>
  );
}
