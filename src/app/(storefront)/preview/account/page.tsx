import { notFound } from 'next/navigation';
import { AccountPreview } from './AccountPreview';

/**
 * The account shell without a session.
 *
 * Every account screen sits behind a login, so reviewing one visually used to
 * mean inventing a throwaway route, seeding it, and deleting it afterwards.
 * This fixture is that route, kept: `npm run dev`, open `/preview/account`, and
 * the shell renders with three sample orders. Production returns 404 — the page
 * is a design surface, not a data source.
 */
export default function PreviewAccountPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <AccountPreview />;
}
