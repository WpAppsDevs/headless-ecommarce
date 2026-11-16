import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/policies/Card';
import { SectionHeading } from '@/components/policies/SectionHeading';

/** A titled policy section: heading plus card, used by every support page. */
export function Section({
  icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <SectionHeading icon={icon} title={title} />
      <Card>{children}</Card>
    </section>
  );
}
