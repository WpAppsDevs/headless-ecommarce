import Image from 'next/image';
import Link from 'next/link';

/**
 * The shop's wordmark, shared by the storefront header and the studio's
 * stripped header so the two cannot drift apart.
 */
export function SiteLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center"
      aria-label="Najifa's Shop — Pakistani Collection"
    >
      <Image
        src="/images/Najifa's Shop Logo.png"
        alt="Najifa's Shop"
        width={140}
        height={48}
        className="h-12 object-contain"
        style={{ width: 'auto' }}
        priority
      />
    </Link>
  );
}
