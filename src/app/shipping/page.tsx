import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { MapPin, Clock, Truck, AlertCircle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Delivery',
  description: 'ডেলিভারি এলাকা, সময় ও চার্জ সম্পর্কে বিস্তারিত জানুন।',
};

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Shipping & Delivery' },
];

export default function ShippingPage() {
  return (
    <div>
      <PageHeader title="Shipping & Delivery" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Coverage */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <MapPin className="h-5 w-5 text-brand-accent" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">ডেলিভারি কভারেজ</h2>
          </div>
          <p className="pl-13 text-sm leading-relaxed text-zinc-600">
            আমরা বাংলাদেশের সকল জেলায় ডেলিভারি প্রদান করি।
          </p>
        </section>

        {/* Delivery Time */}
        <section className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <Clock className="h-5 w-5 text-brand-accent" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">ডেলিভারি সময়</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-border bg-brand-section p-6 text-center">
              <p className="mb-1 text-sm font-semibold text-zinc-500">ঢাকা সিটি</p>
              <p className="text-3xl font-bold text-brand-accent">১–৩</p>
              <p className="mt-1 text-sm text-zinc-500">কর্মদিবস</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-section p-6 text-center">
              <p className="mb-1 text-sm font-semibold text-zinc-500">ঢাকার বাইরে</p>
              <p className="text-3xl font-bold text-brand-accent">২–৫</p>
              <p className="mt-1 text-sm text-zinc-500">কর্মদিবস</p>
            </div>
          </div>
        </section>

        {/* Delivery Charge */}
        <section className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <Truck className="h-5 w-5 text-brand-accent" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">ডেলিভারি চার্জ</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-brand-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-accent/10">
                  <th className="px-6 py-3.5 text-left font-semibold text-zinc-700">এলাকা</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-zinc-700">চার্জ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-brand-border">
                  <td className="px-6 py-4 text-zinc-600">ঢাকা</td>
                  <td className="px-6 py-4 text-right font-bold text-zinc-900">৳৮০</td>
                </tr>
                <tr className="border-t border-brand-border">
                  <td className="px-6 py-4 text-zinc-600">ঢাকার বাইরে</td>
                  <td className="px-6 py-4 text-right font-bold text-zinc-900">৳১২০</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Delay Notice */}
        <section className="mb-10">
          <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h3 className="mb-1 font-semibold text-zinc-800">ডেলিভারি বিলম্ব</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                জাতীয় ছুটি, প্রাকৃতিক দুর্যোগ বা কুরিয়ারজনিত সমস্যার কারণে ডেলিভারিতে
                বিলম্ব হতে পারে। এই ধরনের পরিস্থিতিতে আমরা আপনাকে অবহিত করব।
              </p>
            </div>
          </div>
        </section>

        {/* Order Confirmation */}
        <section className="mb-10">
          <div className="flex gap-4 rounded-2xl border border-brand-border bg-brand-section p-5">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
            <div>
              <h3 className="mb-1 font-semibold text-zinc-800">অর্ডার নিশ্চিতকরণ</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                অর্ডার নিশ্চিত করার জন্য আমাদের টিম ফোন বা SMS-এর মাধ্যমে আপনার সাথে
                যোগাযোগ করতে পারে।
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
