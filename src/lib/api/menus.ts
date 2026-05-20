import { config } from '@/lib/config';

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target: '_self' | '_blank';
  parent: number;
  order: number;
}

export interface NavLink {
  href: string;
  label: string;
  target: '_self' | '_blank';
}

/** Convert an absolute WordPress URL to a relative Next.js path. */
function toRelativeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}

/**
 * Fetch nav menu items for a registered WordPress menu location.
 * Calls GET /wp-json/wpadhlwrapi/v1/menus/{location}
 * Revalidates every 5 minutes (ISR).
 */
export async function getMenuByLocation(location: string): Promise<NavLink[]> {
  try {
    const res = await fetch(
      `${config.apiBase}/${config.productsNs}/menus/${location}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: MenuItem[] = Array.isArray(data) ? data : (data.data ?? []);
    return items
      .filter((item) => item.parent === 0) // top-level only
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        href: toRelativeUrl(item.url),
        label: item.title,
        target: item.target === '_blank' ? '_blank' : '_self',
      }));
  } catch {
    return [];
  }
}
