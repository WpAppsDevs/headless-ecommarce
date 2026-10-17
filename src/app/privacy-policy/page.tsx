import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ShieldCheck, Info, CheckCircle2, Users, Cookie, Lock, Mail, Phone, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeading, Card, BulletList } from '@/components/policies/PolicyUI';

export const metadata: Metadata = {
  title: 'প্রাইভেসি পলিসি',
  description: 'আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সংরক্ষণ করি তা জানুন।',
};

const BREADCRUMBS = [
  { label: 'হোম', href: '/' },
  { label: 'প্রাইভেসি পলিসি' },
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

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageHeader title="প্রাইভেসি পলিসি" breadcrumbs={BREADCRUMBS} />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="mb-10 text-sm text-brand-text-muted">
          সর্বশেষ আপডেট: অক্টোবর ২০২৬
        </Card>

        <Section icon={ShieldCheck} title="ভূমিকা (Introduction)">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            আমাদের স্টোরে আপনাকে স্বাগতম। আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা
            করতে প্রতিশ্রুতিবদ্ধ। এই Privacy Policy ব্যাখ্যা করে আমরা কী তথ্য সংগ্রহ করি,
            কীভাবে ব্যবহার করি এবং কীভাবে সংরক্ষণ করি।
          </p>
        </Section>

        <Section icon={Info} title="তথ্য সংগ্রহ">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:
          </p>
          <BulletList
            items={[
              'নাম',
              'মোবাইল নম্বর',
              'ইমেইল ঠিকানা',
              'ডেলিভারি ঠিকানা',
              'বিলিং তথ্য',
              'IP Address',
              'ব্রাউজার ও ডিভাইস সংক্রান্ত তথ্য',
            ]}
          />
        </Section>

        <Section icon={CheckCircle2} title="তথ্য ব্যবহারের উদ্দেশ্য">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            আমরা আপনার তথ্য ব্যবহার করি:
          </p>
          <BulletList
            items={[
              'অর্ডার প্রক্রিয়াকরণ ও ডেলিভারির জন্য',
              'গ্রাহক সহায়তা প্রদানের জন্য',
              'অর্ডার আপডেট পাঠানোর জন্য',
              'ওয়েবসাইটের কার্যকারিতা উন্নত করার জন্য',
              'প্রতারণা প্রতিরোধের জন্য',
            ]}
          />
        </Section>

        <Section icon={Users} title="তথ্য শেয়ারিং">
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না।
          </p>
          <p className="mb-3 text-sm leading-relaxed text-brand-text-muted">
            প্রয়োজনে নিম্নোক্ত পক্ষের সাথে তথ্য শেয়ার করা হতে পারে:
          </p>
          <BulletList items={['কুরিয়ার সার্ভিস', 'পেমেন্ট গেটওয়ে', 'ওয়েবসাইট সেবা প্রদানকারী']} />
        </Section>

        <Section icon={Cookie} title="Cookies">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            আমাদের ওয়েবসাইট ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে Cookies ব্যবহার করতে পারে।
            Cookies হলো ছোট ডেটা ফাইল যা আপনার ব্রাউজারে সংরক্ষিত হয়।
          </p>
        </Section>

        <Section icon={Lock} title="তথ্য নিরাপত্তা">
          <p className="text-sm leading-relaxed text-brand-text-muted">
            আমরা আপনার তথ্য নিরাপদ রাখার জন্য যুক্তিসঙ্গত প্রযুক্তিগত ও প্রশাসনিক ব্যবস্থা
            গ্রহণ করি। তবে ইন্টারনেটের মাধ্যমে কোনো তথ্য প্রেরণ সম্পূর্ণ নিরাপদ নয় বলে
            নিশ্চয়তা দেওয়া সম্ভব নয়।
          </p>
        </Section>

        <Section icon={Mail} title="যোগাযোগ">
          <p className="mb-4 text-sm leading-relaxed text-brand-text-muted">
            Privacy Policy সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:
          </p>
          <div className="space-y-3">
            <a
              href="mailto:support@najifasshop.com"
              className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0" />
              support@najifasshop.com
            </a>
            <a
              href="tel:+8801841654663"
              className="flex items-center gap-2.5 text-sm text-brand-accent transition-colors hover:underline"
            >
              <Phone className="h-4 w-4 shrink-0" />
              +880 1841-654663
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
        </Section>
      </div>
    </div>
  );
}
