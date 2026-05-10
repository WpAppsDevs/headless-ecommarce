import { redirect } from 'next/navigation';

/** Wishlist has moved into the account dashboard. */
export default function WishlistPage() {
  redirect('/account?tab=wishlist');
}
