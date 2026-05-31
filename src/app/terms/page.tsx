import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'আমাদের ওয়েবসাইট ব্যবহারের শর্তাবলী পড়ুন।',
};

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Terms of Service' },
];

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-zinc-900">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-bold text-white">
          {number}
        </span>
        {title}
      </h2>
      <div className="pl-11 text-sm leading-relaxed text-zinc-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div>
      <PageHeader title="Terms of Service" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-brand-border bg-brand-section px-6 py-5 text-sm text-zinc-600">
          সর্বশেষ আপডেট: জুন ২০২৫
        </div>

        <Section number="১" title="গ্রহণযোগ্যতা (Acceptance)">
          <p>
            এই ওয়েবসাইট ব্যবহার করে আপনি আমাদের Terms &amp; Conditions মেনে নিতে সম্মত
            হচ্ছেন। আপনি যদি এই শর্তগুলির সাথে একমত না হন, তবে অনুগ্রহ করে আমাদের ওয়েবসাইট
            ব্যবহার থেকে বিরত থাকুন।
          </p>
        </Section>

        <Section number="২" title="পণ্যের তথ্য (Product Information)">
          <p>
            আমরা পণ্যের ছবি ও বিবরণ যথাসম্ভব সঠিকভাবে প্রদর্শনের চেষ্টা করি। তবে
            ডিভাইসের ডিসপ্লে সেটিংসের কারণে রঙে সামান্য পার্থক্য হতে পারে। এটি পণ্যের
            কোনো ত্রুটি হিসেবে বিবেচিত হবে না।
          </p>
        </Section>

        <Section number="৩" title="মূল্য (Pricing)">
          <p>
            পণ্যের মূল্য পূর্ব ঘোষণা ছাড়াই পরিবর্তন করার অধিকার আমরা সংরক্ষণ করি। মূল্য
            পরিবর্তনের আগে দেওয়া কোনো অর্ডার পুরনো মূল্যেই কার্যকর থাকবে।
          </p>
        </Section>

        <Section number="৪" title="অর্ডার গ্রহণ (Order Acceptance)">
          <p className="mb-3">নিম্নলিখিত ক্ষেত্রে অর্ডার বাতিল করা হতে পারে:</p>
          <ul className="space-y-2">
            {[
              'পণ্য স্টকে না থাকা',
              'ভুল মূল্য প্রদর্শিত হওয়া',
              'সন্দেহজনক বা প্রতারণামূলক অর্ডার',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            অর্ডার বাতিল হলে আমরা আপনাকে যত দ্রুত সম্ভব জানাবো।
          </p>
        </Section>

        <Section number="৫" title="মেধাস্বত্ব (Intellectual Property)">
          <p>
            ওয়েবসাইটের সকল কনটেন্ট, ছবি, লোগো ও ডিজাইন আমাদের স্টোরের সম্পত্তি। পূর্ব
            অনুমতি ছাড়া এগুলো ব্যবহার, কপি বা বিতরণ করা নিষিদ্ধ।
          </p>
        </Section>

        <Section number="৬" title="দায়বদ্ধতার সীমা (Limitation of Liability)">
          <p>
            আমরা কোনো পরোক্ষ ক্ষতি, ব্যবসায়িক ক্ষতি বা লাভের ক্ষতির জন্য দায়ী থাকবো
            না। আমাদের সর্বোচ্চ দায় আপনার পরিশোধিত পণ্যের মূল্যের মধ্যে সীমাবদ্ধ থাকবে।
          </p>
        </Section>

        <Section number="৭" title="পরিবর্তন (Changes to Terms)">
          <p>
            আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। পরিবর্তন এই পৃষ্ঠায়
            প্রকাশিত হবে। ওয়েবসাইট ব্যবহার অব্যাহত রাখলে আপনি পরিবর্তিত শর্তাবলী মেনে
            নিয়েছেন বলে গণ্য হবে।
          </p>
        </Section>
      </div>
    </div>
  );
}
