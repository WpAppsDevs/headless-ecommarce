import { cookies } from 'next/headers';
import { LOCALE_COOKIE, resolveLocale, type Locale } from './locales';

/**
 * The locale for this request, read from the cookie.
 *
 * Server components call this instead of receiving the locale as a prop from
 * the layout, so a page deep in the tree does not need every parent to thread
 * it down. `cookies()` is request-scoped, so repeated calls cost nothing.
 *
 * Reading the cookie opts the route into per-request rendering; that is a
 * recorded consequence of ADR-0008, not an accident.
 */
export async function getLocale(): Promise<Locale> {
  return resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}
