import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সংরক্ষণ করি তা জানুন।',
};

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Privacy Policy' },
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

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageHeader title="Privacy Policy" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-brand-border bg-brand-section px-6 py-5 text-sm text-zinc-600">
          সর্বশেষ আপডেট: জুন ২০২৫
        </div>

        <Section number="১" title="ভূমিকা (Introduction)">
          <p>
            আমাদের স্টোরে আপনাকে স্বাগতম। আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা
            করতে প্রতিশ্রুতিবদ্ধ। এই Privacy Policy ব্যাখ্যা করে আমরা কী তথ্য সংগ্রহ করি,
            কীভাবে ব্যবহার করি এবং কীভাবে সংরক্ষণ করি।
          </p>
        </Section>

        <Section number="২" title="তথ্য সংগ্রহ">
          <p className="mb-3">আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:</p>
          <ul className="space-y-2">
            {[
              'নাম',
              'মোবাইল নম্বর',
              'ইমেইল ঠিকানা',
              'ডেলিভারি ঠিকানা',
              'বিলিং তথ্য',
              'IP Address',
              'ব্রাউজার ও ডিভাইস সংক্রান্ত তথ্য',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section number="৩" title="তথ্য ব্যবহারের উদ্দেশ্য">
          <p className="mb-3">আমরা আপনার তথ্য ব্যবহার করি:</p>
          <ul className="space-y-2">
            {[
              'অর্ডার প্রক্রিয়াকরণ ও ডেলিভারির জন্য',
              'গ্রাহক সহায়তা প্রদানের জন্য',
              'অর্ডার আপডেট পাঠানোর জন্য',
              'ওয়েবসাইটের কার্যকারিতা উন্নত করার জন্য',
              'প্রতারণা প্রতিরোধের জন্য',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section number="৪" title="তথ্য শেয়ারিং">
          <p className="mb-3">আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না।</p>
          <p className="mb-3">প্রয়োজনে নিম্নোক্ত পক্ষের সাথে তথ্য শেয়ার করা হতে পারে:</p>
          <ul className="space-y-2">
            {['কুরিয়ার সার্ভিস', 'পেমেন্ট গেটওয়ে', 'ওয়েবসাইট সেবা প্রদানকারী'].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section number="৫" title="Cookies">
          <p>
            আমাদের ওয়েবসাইট ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে Cookies ব্যবহার করতে পারে।
            Cookies হলো ছোট ডেটা ফাইল যা আপনার ব্রাউজারে সংরক্ষিত হয়।
          </p>
        </Section>

        <Section number="৬" title="তথ্য নিরাপত্তা">
          <p>
            আমরা আপনার তথ্য নিরাপদ রাখার জন্য যুক্তিসঙ্গত প্রযুক্তিগত ও প্রশাসনিক ব্যবস্থা
            গ্রহণ করি। তবে ইন্টারনেটের মাধ্যমে কোনো তথ্য প্রেরণ সম্পূর্ণ নিরাপদ নয় বলে
            নিশ্চয়তা দেওয়া সম্ভব নয়।
          </p>
        </Section>

        <Section number="৭" title="যোগাযোগ">
          <p className="mb-4">Privacy Policy সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
          <div className="space-y-3">
            <a
              href="mailto:support@yourdomain.com"
              className="flex items-center gap-2.5 text-brand-accent transition-colors hover:underline"
            >
              <Mail className="h-4 w-4" />
              support@yourdomain.com
            </a>
            <a
              href="tel:+8801XXXXXXXXX"
              className="flex items-center gap-2.5 text-brand-accent transition-colors hover:underline"
            >
              <Phone className="h-4 w-4" />
              +8801XXXXXXXXX
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}
