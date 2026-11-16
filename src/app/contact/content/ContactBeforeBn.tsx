import Link from 'next/link';
import { Card } from '@/components/policies/Card';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { Clock } from 'lucide-react';

export function ContactBeforeBn() {
  return (
    <section className="mt-10">
      <SectionHeading icon={Clock} title="লেখার আগে জেনে নিন" />
      <Card>
        <p className="text-sm leading-relaxed text-brand-text-muted">
          আপনার ইমেইল ঠিকানা দিয়ে{' '}
          <Link
            href="/track-order"
            className="font-medium text-brand-accent-strong underline underline-offset-2"
          >
            অর্ডার ট্র্যাকিং পাতায়
          </Link>{' '}
          নিজেই অর্ডারের অবস্থা দেখতে পারেন। ডেলিভারি ও এক্সচেঞ্জের নিয়ম আছে{' '}
          <Link
            href="/shipping"
            className="font-medium text-brand-accent-strong underline underline-offset-2"
          >
            শিপিং নীতিমালায়
          </Link>{' '}
          এবং{' '}
          <Link
            href="/returns"
            className="font-medium text-brand-accent-strong underline underline-offset-2"
          >
            রিটার্ন নীতিমালায়
          </Link>
          .
        </p>
      </Card>
    </section>
  );
}

export const contactChannels = [
  { detail: 'অর্ডারের খবর ও স্টাইলিং প্রশ্নের জন্য সবচেয়ে দ্রুত।', label: 'হোয়াটসঅ্যাপে চ্যাট করুন' },
  { detail: 'বিস্তারিত জিজ্ঞাসা, ইনভয়েস ও হোলসেল অনুরোধের জন্য।', label: 'support@najifasshop.com' },
  { detail: 'জরুরি অর্ডার সহায়তার জন্য অফিস চলাকালীন সময়ে।', label: '+880 1841-654663' },
];
