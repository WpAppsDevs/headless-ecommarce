import { redirect } from 'next/navigation';

/**
 * The dashboard opens on the product list. Until there is more than one section
 * this is a plain redirect, so `/studio` never renders a second landing page
 * that could drift from the list.
 */
export default function StudioIndexPage() {
  redirect('/studio/products');
}
