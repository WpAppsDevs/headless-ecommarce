import { redirect } from 'next/navigation';

/**
 * The staff sign-in page is gone: there is one login for everybody, and the
 * role in the profile decides where the person lands. This path still exists
 * so old bookmarks and links do not 404.
 */
export default function LegacyStudioLoginPage() {
  redirect('/login?redirect=/studio');
}
