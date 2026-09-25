import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  RefreshCw,
  Package,
  Plane,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Banknote,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import {
  SectionHeading,
  Card,
  BulletList,
  NoteCallout,
  TypePanel,
} from '@/components/policies/PolicyUI';

export const metadata: Metadata = {
  title: 'রিটার্ন ও এক্সচেঞ্জ',
  description: 'স্টক পণ্য ও প্রি-অর্ডার পণ্যের এক্সচেঞ্জ এবং রিফান্ড পলিসি সম্পর্কে বিস্তারিত জানুন।',
};

const BREADCRUMBS = [{ label: 'হোম', href: '/' }, { label: 'রিটার্ন ও এক্সচেঞ্জ' }];

const STOCK_STEPS = ['পণ্য গ্রহণ', 'কুরিয়ারের সামনে পণ্য চেক', 'ত্রুটি পাওয়া গেলে', 'কুরিয়ারের কাছে ফেরত'];

const STOCK_ELIGIBLE = [
  'ভুল পণ্য পাঠানো হয়েছে',
  'পণ্যে উৎপাদনজনিত ত্রুটি রয়েছে',
  'পণ্য ক্ষতিগ্রস্ত অবস্থায় পৌঁছেছে',
  'অর্ডার করা পণ্যের সঙ্গে প্রাপ্ত পণ্য মিলছে না',
  'আমাদের নির্ধারিত নীতিমালা অনুযায়ী অন্যান্য গ্রহণযোগ্য ত্রুটি',
];

const PREORDER_ELIGIBLE = [
  'ভুল পণ্য পাঠানো হয়েছে',
  'পণ্যে উৎপাদনজনিত ত্রুটি রয়েছে বা পণ্য ছেঁড়া/ফাটা আছে',
];

const NOT_ELIGIBLE = [
  'পণ্য ব্যবহারের কারণে ক্ষতিগ্রস্ত হলে',
  'customer-এর কারণে পণ্যের ক্ষতি হলে',
  'পণ্য পরিবর্তন বা ব্যবহারের ফলে মূল অবস্থায় না থাকলে',
  'আমাদের নির্ধারিত exchange conditions পূরণ না করলে',
];

export default function ReturnsPage() {
  return (
    <div>
      <PageHeader title="রিটার্ন ও এক্সচেঞ্জ" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Eligibility */}
        <section className="mb-10">
          <SectionHeading icon={RefreshCw} title="এক্সচেঞ্জের যোগ্যতা" />
          <Card>
            <p className="text-sm leading-relaxed text-brand-text-muted">
              এক্সচেঞ্জের যোগ্যতা পণ্যের ধরন অনুযায়ী নির্ধারিত হয়। আমাদের দুই ধরনের পণ্যের জন্য
              এক্সচেঞ্জ নীতিমালা আলাদা —{' '}
              <strong className="font-semibold text-brand-text">স্টক পণ্য</strong> ও{' '}
              <strong className="font-semibold text-brand-text">প্রি-অর্ডার পণ্য</strong>।
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              পণ্য গ্রহণের সময় কুরিয়ার প্রতিনিধির সামনে পণ্যটি চেক করে নিলে এক্সচেঞ্জের প্রয়োজন হলে তা
              দ্রুত ও সহজে সম্পন্ন করা যায়।
            </p>
          </Card>
        </section>

        {/* Stock exchange */}
        <section className="mb-10">
          <TypePanel
            icon={Package}
            title="স্টক পণ্যের এক্সচেঞ্জ"
            subtitle="বাংলাদেশে স্টকে থাকা পণ্য"
          >
            <p className="text-sm leading-relaxed text-brand-text-muted">
              স্টক পণ্য customer-এর কাছে পৌঁছানোর সময় customer-কে কুরিয়ার প্রতিনিধির সামনে পণ্যটি চেক
              করতে হবে। পণ্য চেক করার সময় যদি এক্সচেঞ্জের জন্য গ্রহণযোগ্য কোনো ত্রুটি পাওয়া যায়,
              তাহলে customer পণ্যটি কুরিয়ারের কাছেই ফেরত দিতে পারবেন।
            </p>

            <h3 className="mb-3 mt-7 text-sm font-semibold text-brand-text">এক্সচেঞ্জের ধাপ</h3>
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STOCK_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="rounded-2xl border border-brand-border bg-brand-card p-4"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/15 text-xs font-bold text-brand-accent">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-sm font-medium leading-snug text-brand-text">{step}</p>
                </li>
              ))}
            </ol>

            <h3 className="mb-3 mt-7 text-sm font-semibold text-brand-text">
              এক্সচেঞ্জের আওতায় থাকতে পারে
            </h3>
            <BulletList items={STOCK_ELIGIBLE} />

            <NoteCallout icon={CheckCircle2} tone="accent" className="mt-6">
              <p className="font-semibold">
                স্টক পণ্য গ্রহণের সময় কুরিয়ার প্রতিনিধির সামনে পণ্যটি অবশ্যই চেক করুন।
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Pre-order exchange */}
        <section className="mb-10">
          <TypePanel
            icon={Plane}
            title="প্রি-অর্ডার পণ্যের এক্সচেঞ্জ"
            subtitle="পাকিস্তান থেকে আনা পণ্য — আলাদা নীতিমালা"
          >
            <p className="text-sm leading-relaxed text-brand-text-muted">
              প্রি-অর্ডার পণ্য পাকিস্তান থেকে বাংলাদেশে আনা হয় এবং আন্তর্জাতিক শিপিং-এর সঙ্গে যুক্ত। তাই
              প্রি-অর্ডার পণ্যের এক্সচেঞ্জ নীতিমালা স্টক পণ্যের থেকে আলাদা এবং এতে বেশি সময় লাগতে পারে।
            </p>

            <h3 className="mb-3 mt-7 text-sm font-semibold text-brand-text">
              প্রি-অর্ডারে যেসব সমস্যা এক্সচেঞ্জের আওতায় পড়ে
            </h3>
            <BulletList items={PREORDER_ELIGIBLE} />

            <NoteCallout icon={AlertCircle} tone="amber" className="mt-6">
              <p className="font-semibold">ছবি ও কালার সংক্রান্ত বিষয়</p>
              <p className="mt-1">
                সাইটে দেখানো ছবির সঙ্গে বাস্তব পণ্যের কালার বা ফটোগ্রাফি অনেক সময় কিছুটা ভিন্ন হতে
                পারে। শুধুমাত্র কালার বা ফটোগ্রাফির এই পার্থক্যের কারণে কোনো এক্সচেঞ্জ প্রযোজ্য হবে না।
              </p>
            </NoteCallout>

            <NoteCallout icon={CheckCircle2} tone="accent" className="mt-4">
              <p className="font-semibold">
                প্রি-অর্ডার পণ্যও গ্রহণের সময় কুরিয়ার প্রতিনিধির সামনে চেক করে নিন।
              </p>
            </NoteCallout>
          </TypePanel>
        </section>

        {/* Not eligible */}
        <section className="mb-10">
          <SectionHeading icon={XCircle} title="যেসব ক্ষেত্রে এক্সচেঞ্জ প্রযোজ্য নয়" />
          <Card>
            <BulletList items={NOT_ELIGIBLE} dotClassName="bg-brand-accent/60" />
          </Card>
        </section>

        {/* Refund policy */}
        <section className="mb-10">
          <SectionHeading icon={Banknote} title="রিফান্ড পলিসি" />
          <Card>
            <p className="text-sm font-medium text-brand-text">
              সাধারণভাবে আমরা Refund প্রদান করি না।
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              তবে বিশেষ পরিস্থিতিতে আমাদের নীতিমালা অনুযায়ী Refund বিবেচনা করা হতে পারে — যেমন:
            </p>
            <BulletList
              className="mt-3"
              items={['অর্ডারকৃত পণ্য স্টকে না থাকলে', 'আমাদের পক্ষ থেকে অর্ডার পূরণ করা সম্ভব না হলে']}
            />
            <p className="mt-4 text-xs leading-relaxed text-brand-text-muted">
              Refund অনুমোদিত হলে আমাদের নির্ধারিত নীতিমালা অনুযায়ী প্রক্রিয়া সম্পন্ন করা হয়। Refund ও
              এক্সচেঞ্জ নীতির মধ্যে কোনো পরস্পরবিরোধী সময়সীমা নেই।
            </p>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <SectionHeading icon={Phone} title="এক্সচেঞ্জের জন্য যোগাযোগ করুন" />
          <Card>
            <p className="text-sm text-brand-text-muted">
              এক্সচেঞ্জ সংক্রান্ত যেকোনো প্রয়োজনে আমাদের সঙ্গে যোগাযোগ করুন:
            </p>
            <div className="mt-4 space-y-3">
              <a
                href="tel:+8801841654663"
                className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +880 1841-654663
              </a>
              <a
                href="mailto:support@najifasshop.com"
                className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" />
                support@najifasshop.com
              </a>
              <a
                href="https://wa.me/8801841654663"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp-এ মেসেজ করুন
              </a>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
