import Link from 'next/link';
import { Card } from '@/components/policies/Card';
import { SectionHeading } from '@/components/policies/SectionHeading';
import { Clock, MessageCircle } from 'lucide-react';

export const contactCopyBn = {
  metadataTitle: 'যোগাযোগ',
  metadataDescription:
    'অর্ডার, পণ্য বা হোলসেল সংক্রান্ত যেকোনো প্রশ্নে নাজিফা’স শপের সঙ্গে যোগাযোগ করুন।',
  pageTitle: 'যোগাযোগ',
  breadcrumb: 'যোগাযোগ',
};


export function ContactIntroBn() {
  return (
    <section className="mb-10">
      <SectionHeading icon={MessageCircle} title="আমাদের টিমের সঙ্গে কথা বলুন" />
      <Card>
        <p className="text-sm leading-relaxed text-brand-text-muted">
          সাইজ, স্টক, প্রি-অর্ডার, ডেলিভারি ও রিটার্ন নিয়ে যেকোনো প্রশ্ন করতে পারেন।
          লিখতে গিয়ে অর্ডার নম্বরটি উল্লেখ করুন, তাহলে আপনার অর্ডারটি দ্রুত খুঁজে বের
          করা সহজ হবে।
        </p>
      </Card>
    </section>
  );
}
