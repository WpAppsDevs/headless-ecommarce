import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Package, Banknote, ShoppingCart, FileText, Scale, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeading, Card, BulletList } from '@/components/policies/PolicyUI';

export const metadata: Metadata = {
  title: 'টার্মস অফ সার্ভিস',
  description: 'আমাদের ওয়েবসাইট ব্যবহারের শর্তাবলী পড়ুন।',
};

const BREADCRUMBS = [
  { label: 'হোম', href: '/' },
  { label: 'টার্মস অফ সার্ভিস' },
];

function Section({
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

export default function TermsPage() {
  return (
    <div>
      <PageHeader title="টার্মস অফ সার্ভিস" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="mb-10 text-sm text-brand-text-muted">
          সর্বশেষ আপডেট: অক্টোবর ২০২৬
        </Card>

        <Section icon={CheckCircle2} title="গ্রহণযোগ্যতা (Acceptance)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            এই ওয়েবসাইট ব্যবহার করে আপনি আমাদের Terms &amp; Conditions মেনে নিতে সম্মত
            হচ্ছেন। আপনি যদি এই শর্তগুলির সাথে একমত না হন, তবে অনুগ্রহ করে আমাদের ওয়েবসাইট
            ব্যবহার থেকে বিরত থাকুন।
          </p>
        </Section>

        <Section icon={Package} title="পণ্যের তথ্য (Product Information)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            আমরা পণ্যের ছবি ও বিবরণ যথাসম্ভব সঠিকভাবে প্রদর্শনের চেষ্টা করি। তবে
            ডিভাইসের ডিসপ্লে সেটিংসের কারণে রঙে সামান্য পার্থক্য হতে পারে। এটি পণ্যের
            কোনো ত্রুটি হিসেবে বিবেচিত হবে না।
          </p>
        </Section>

        <Section icon={Banknote} title="মূল্য (Pricing)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            পণ্যের মূল্য পূর্ব ঘোষণা ছাড়াই পরিবর্তন করার অধিকার আমরা সংরক্ষণ করি। মূল্য
            পরিবর্তনের আগে দেওয়া কোনো অর্ডার পুরনো মূল্যেই কার্যকর থাকবে।
          </p>
        </Section>

        <Section icon={ShoppingCart} title="অর্ডার গ্রহণ (Order Acceptance)">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            নিম্নলিখিত ক্ষেত্রে অর্ডার বাতিল করা হতে পারে:
          </p>
          <BulletList
            items={[
              'পণ্য স্টকে না থাকা',
              'ভুল মূল্য প্রদর্শিত হওয়া',
              'সন্দেহজনক বা প্রতারণামূলক অর্ডার',
            ]}
          />
          <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
            অর্ডার বাতিল হলে আমরা আপনাকে যত দ্রুত সম্ভব জানাবো।
          </p>
        </Section>

        <Section icon={FileText} title="মেধাস্বত্ব (Intellectual Property)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            ওয়েবসাইটের সকল কনটেন্ট, ছবি, লোগো ও ডিজাইন আমাদের স্টোরের সম্পত্তি। পূর্ব
            অনুমতি ছাড়া এগুলো ব্যবহার, কপি বা বিতরণ করা নিষিদ্ধ।
          </p>
        </Section>

        <Section icon={Scale} title="দায়বদ্ধতার সীমা (Limitation of Liability)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            আমরা কোনো পরোক্ষ ক্ষতি, ব্যবসায়িক ক্ষতি বা লাভের ক্ষতির জন্য দায়ী থাকবো
            না। আমাদের সর্বোচ্চ দায় আপনার পরিশোধিত পণ্যের মূল্যের মধ্যে সীমাবদ্ধ থাকবে।
          </p>
        </Section>

        <Section icon={RefreshCw} title="পরিবর্তন (Changes to Terms)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। পরিবর্তন এই পৃষ্ঠায়
            প্রকাশিত হবে। ওয়েবসাইট ব্যবহার অব্যাহত রাখলে আপনি পরিবর্তিত শর্তাবলী মেনে
            নিয়েছেন বলে গণ্য হবে।
          </p>
        </Section>
      </div>
    </div>
  );
}
