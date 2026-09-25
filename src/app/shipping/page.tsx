import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  MapPin,
  Package,
  Plane,
  Clock,
  Truck,
  AlertCircle,
  Phone,
  Scale,
} from 'lucide-react';
import {
  SectionHeading,
  Card,
  StatCard,
  NoteCallout,
  TypePanel,
} from '@/components/policies/PolicyUI';

export const metadata: Metadata = {
  title: 'শিপিং ও ডেলিভারি',
  description: 'ডেলিভারি এলাকা, সময়, স্থানীয় চার্জ ও প্রি-অর্ডার শিপিং চার্জ সম্পর্কে বিস্তারিত জানুন।',
};

const BREADCRUMBS = [{ label: 'হোম', href: '/' }, { label: 'শিপিং ও ডেলিভারি' }];

const WEIGHT_EXAMPLES = [
  { weight: '১ কেজি', charge: '৳১,৮৫০' },
  { weight: '২ কেজি', charge: '৳৩,৭০০' },
  { weight: '৫ কেজি', charge: '৳৯,২৫০' },
];

export default function ShippingPage() {
  return (
    <div>
      <PageHeader title="শিপিং ও ডেলিভারি" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Coverage */}
        <section className="mb-10">
          <SectionHeading icon={MapPin} title="ডেলিভারি কভারেজ" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              আমরা বাংলাদেশের সকল জেলায় ডেলিভারি প্রদান করি।
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              আমাদের পণ্য দুই ধরনের — <strong className="font-semibold text-brand-text">স্টক পণ্য</strong> ও{' '}
              <strong className="font-semibold text-brand-text">প্রি-অর্ডার পণ্য</strong>। নিচে দুই ধরনের
              পণ্যের ডেলিভারি সময় ও চার্জ আলাদাভাবে দেওয়া হলো।
            </p>
          </Card>
        </section>

        {/* Stock products */}
        <section className="mb-10">
          <TypePanel
            icon={Package}
            title="স্টক পণ্য"
            subtitle="বর্তমানে বাংলাদেশে আমাদের স্টকে থাকা পণ্য"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Clock className="h-4 w-4 text-brand-accent" />
              ডেলিভারি সময়
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="ঢাকা সিটি" value="১–৩" sub="কর্মদিবস" />
              <StatCard label="ঢাকার বাইরে" value="২–৫" sub="কর্মদিবস" />
            </div>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Truck className="h-4 w-4 text-brand-accent" />
              ডেলিভারি চার্জ
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="ঢাকার মধ্যে" value="৳৮০" />
              <StatCard label="ঢাকার বাইরে" value="৳১২০" />
            </div>
          </TypePanel>
        </section>

        {/* Pre-order products */}
        <section className="mb-10">
          <TypePanel
            icon={Plane}
            title="প্রি-অর্ডার পণ্য"
            subtitle="পাকিস্তান থেকে বাংলাদেশে আনা হয়"
          >
            <p className="text-sm leading-relaxed text-brand-text-muted">
              প্রি-অর্ডার পণ্য পাকিস্তান থেকে বাংলাদেশে আনা হয়। পণ্য বাংলাদেশে পৌঁছানোর পর আমাদের পক্ষ
              থেকে customer-এর কাছে ডেলিভারি করা হয়।
            </p>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Clock className="h-4 w-4 text-brand-accent" />
              আনুমানিক ডেলিভারি সময়
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="সর্বমোট আনুমানিক সময়" value="২০–২৫" sub="দিন" />
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5">
                <p className="text-sm leading-relaxed text-brand-text-muted">
                  এই সময়ের মধ্যে পাকিস্তান থেকে বাংলাদেশে পণ্য আসার সময় এবং বাংলাদেশে পৌঁছানোর পর
                  customer-এর কাছে স্থানীয় ডেলিভারি — দুইটি ধাপই অন্তর্ভুক্ত।
                </p>
                <p className="mt-3 text-xs font-medium leading-relaxed text-brand-accent">
                  এটি একটি আনুমানিক সময়সীমা — নির্দিষ্ট বা গ্যারান্টিযুক্ত সময় নয়।
                </p>
              </div>
            </div>

            <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text">
              <Scale className="h-4 w-4 text-brand-accent" />
              শিপিং ও ডেলিভারি চার্জ
            </h3>

            {/* Pakistan → Bangladesh (per kg) */}
            <div className="rounded-2xl border border-brand-accent/25 bg-brand-accent/[0.06] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-brand-text">পাকিস্তান → বাংলাদেশ</p>
                <p className="font-serif text-2xl font-bold text-brand-accent">৳১,৮৫০</p>
                <p className="text-xs text-brand-text-muted">প্রতি কেজি</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
                শিপিং চার্জ পণ্যের/শিপমেন্টের মোট ওজন অনুযায়ী হিসাব হবে।
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {WEIGHT_EXAMPLES.map(({ weight, charge }) => (
                  <div
                    key={weight}
                    className="rounded-xl border border-brand-border bg-brand-section px-3 py-2.5 text-center"
                  >
                    <p className="text-xs text-brand-text-muted">{weight}</p>
                    <p className="mt-0.5 text-sm font-bold text-brand-text">{charge}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bangladesh → Customer (local) */}
            <div className="mt-4 rounded-2xl border border-brand-border bg-brand-card p-5">
              <p className="text-sm font-semibold text-brand-text">বাংলাদেশ → Customer</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
                বাংলাদেশে পণ্য পৌঁছানোর পর customer-এর ঠিকানা অনুযায়ী স্থানীয় ডেলিভারি চার্জ:
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard label="ঢাকার মধ্যে" value="৳৮০" className="bg-brand-section" />
                <StatCard label="ঢাকার বাইরে" value="৳১২০" className="bg-brand-section" />
              </div>
            </div>

            <NoteCallout icon={AlertCircle} tone="accent" className="mt-4">
              <p className="font-semibold">গুরুত্বপূর্ণ</p>
              <p className="mt-1">
                প্রি-অর্ডারের ক্ষেত্রে পাকিস্তান থেকে বাংলাদেশে শিপিং চার্জ{' '}
                <strong className="font-semibold">৳১,৮৫০ প্রতি কেজি</strong> এবং বাংলাদেশে পৌঁছানোর পর
                স্থানীয় ডেলিভারি চার্জ <strong className="font-semibold">৳৮০/৳১২০</strong> — এই দুইটি
                আলাদাভাবে হিসাব হবে।
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Delivery delays */}
        <section className="mb-10">
          <SectionHeading
            icon={AlertCircle}
            title="ডেলিভারি বিলম্ব"
            subtitle="অনাকাঙ্ক্ষিত পরিস্থিতিতে ডেলিভারি বিলম্ব হতে পারে"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NoteCallout icon={Package} tone="amber">
              <p className="font-semibold">স্টক পণ্যের ক্ষেত্রে</p>
              <p className="mt-1">
                সরকারি ছুটি, প্রাকৃতিক দুর্যোগ, কুরিয়ার সংক্রান্ত সমস্যা বা অন্যান্য অনাকাঙ্ক্ষিত
                পরিস্থিতির কারণে স্টক পণ্যের ডেলিভারিতে সাময়িক বিলম্ব হতে পারে।
              </p>
            </NoteCallout>
            <NoteCallout icon={Plane} tone="amber">
              <p className="font-semibold">প্রি-অর্ডারের ক্ষেত্রে</p>
              <p className="mt-1">
                পাকিস্তান থেকে বাংলাদেশে পণ্য পরিবহনের সময় shipment, logistics, customs/clearance বা
                অন্যান্য অনাকাঙ্ক্ষিত সমস্যার কারণে নির্ধারিত সময়ের চেয়ে বেশি সময় লাগতে পারে।
              </p>
              <p className="mt-2 font-medium">
                ২০–২৫ দিন একটি আনুমানিক ডেলিভারি সময়।
              </p>
            </NoteCallout>
          </div>
        </section>

        {/* Order confirmation */}
        <section>
          <SectionHeading icon={Phone} title="অর্ডার নিশ্চিতকরণ" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              অর্ডার নিশ্চিত করার জন্য আমাদের টিম প্রয়োজনে customer-এর সঙ্গে ফোন অথবা SMS-এর মাধ্যমে
              যোগাযোগ করতে পারে।
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
