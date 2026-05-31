import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { CheckCircle2, XCircle, RefreshCw, Banknote, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  description: 'পণ্য Exchange ও Refund পলিসি সম্পর্কে বিস্তারিত জানুন।',
};

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Returns & Exchanges' },
];

export default function ReturnsPage() {
  return (
    <div>
      <PageHeader title="Returns & Exchanges" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Eligibility banner */}
        <div className="mb-10 flex items-start gap-4 rounded-2xl border border-brand-border bg-brand-section p-6">
          <RefreshCw className="mt-0.5 h-6 w-6 shrink-0 text-brand-accent" />
          <div>
            <h2 className="mb-1 text-lg font-bold text-zinc-900">Exchange Eligibility</h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              পণ্য গ্রহণের{' '}
              <span className="font-semibold text-brand-accent">৩ দিনের মধ্যে</span> Exchange-এর
              জন্য আবেদন করতে হবে।
            </p>
          </div>
        </div>

        {/* Accepted / Not accepted */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          {/* Accepted */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-green-800">Exchange গ্রহণযোগ্য</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-green-800">
              {[
                'ভুল পণ্য ডেলিভারি করা হয়েছে',
                'ত্রুটিপূর্ণ পণ্য পাওয়া গেছে',
                'ক্ষতিগ্রস্ত অবস্থায় পণ্য ডেলিভারি হয়েছে',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not accepted */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-red-800">Exchange গ্রহণযোগ্য নয়</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-red-800">
              {[
                'পণ্য ব্যবহৃত হয়েছে',
                'ট্যাগ অপসারণ করা হয়েছে',
                'ধোয়া বা পরিবর্তন করা হয়েছে',
                'নির্ধারিত সময়ের পরে আবেদন করা হয়েছে',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Size Exchange */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-zinc-900">সাইজ Exchange</h2>
          <div className="rounded-2xl border border-brand-border bg-brand-section p-6 text-sm leading-relaxed text-zinc-600">
            <ul className="space-y-2.5">
              {[
                'সাইজ পরিবর্তন স্টক উপলব্ধতার উপর নির্ভরশীল।',
                'কুরিয়ার চার্জ গ্রাহককে বহন করতে হতে পারে।',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Refund Policy */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Banknote className="h-6 w-6 text-brand-accent" />
            <h2 className="text-xl font-bold text-zinc-900">Refund Policy</h2>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-section p-6 text-sm leading-relaxed text-zinc-600">
            <p className="mb-4 font-medium text-zinc-700">
              সাধারণত আমরা Refund প্রদান করি না।
            </p>
            <p className="mb-3">তবে নিম্নলিখিত ক্ষেত্রে Refund বিবেচনা করা হতে পারে:</p>
            <ul className="mb-4 space-y-2">
              {[
                'অর্ডারকৃত পণ্য স্টকে না থাকলে',
                'আমাদের পক্ষ থেকে অর্ডার পূরণ করা সম্ভব না হলে',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="rounded-lg bg-brand-accent/10 px-4 py-2.5 text-xs font-medium text-zinc-700">
              Refund অনুমোদিত হলে{' '}
              <span className="font-bold text-brand-accent">৭–১০ কর্মদিবসের</span> মধ্যে সম্পন্ন
              করা হবে।
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-zinc-900">Exchange Request</h2>
          <div className="rounded-2xl border border-brand-border bg-brand-section p-6">
            <p className="mb-4 text-sm text-zinc-600">Exchange এর জন্য আমাদের সাথে যোগাযোগ করুন:</p>
            <div className="space-y-3">
              <a
                href="tel:+8801XXXXXXXXX"
                className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
              >
                <Phone className="h-4 w-4" />
                +8801XXXXXXXXX
              </a>
              <a
                href="mailto:support@yourdomain.com"
                className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
              >
                <Mail className="h-4 w-4" />
                support@yourdomain.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
