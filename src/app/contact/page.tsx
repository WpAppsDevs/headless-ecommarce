import type { Metadata } from 'next';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { config } from '@/lib/config';
import { getLocale } from '@/i18n/server';
import { getDictionary } from '@/i18n/get-dictionary';
import { contactCopyEn } from './content/ContactIntroEn';
import { contactCopyBn } from './content/ContactIntroBn';
import { contactChannelsEn } from './content/ContactChannelsEn';
import { contactChannelsBn } from './content/ContactChannelsBn';
import { ContactIntroEn } from './content/ContactIntroEn';
import { ContactIntroBn } from './content/ContactIntroBn';
import { ContactBeforeEn } from './content/ContactBeforeEn';
import { ContactBeforeBn } from './content/ContactBeforeBn';

const COPY = { en: contactCopyEn, bn: contactCopyBn };
const CHANNEL_COPY = { en: contactChannelsEn, bn: contactChannelsBn };
const INTRO = { en: ContactIntroEn, bn: ContactIntroBn };
const BEFORE = { en: ContactBeforeEn, bn: ContactBeforeBn };

const CHANNELS = [
  { icon: MessageCircle, title: 'WhatsApp', href: config.whatsappUrl },
  { icon: Mail, title: 'Email', href: 'mailto:support@najifasshop.com' },
  { icon: Phone, title: 'Phone', href: 'tel:+8801841654663' },
];

export async function generateMetadata(): Promise<Metadata> {
  const copy = COPY[await getLocale()];

  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const copy = COPY[locale];
  const dictionary = getDictionary(locale);
  const channelCopy = CHANNEL_COPY[locale];
  const Intro = INTRO[locale];
  const Before = BEFORE[locale];

  return (
    <div>
      <PageHeader
        title={copy.pageTitle}
        breadcrumbs={[{ label: dictionary.common.home, href: '/' }, { label: copy.breadcrumb }]}
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Intro />

        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, href }, index) => {
            const { detail, label } = channelCopy[index];

            return (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group rounded-2xl border border-brand-border bg-brand-section p-5 transition hover:border-brand-accent/50 hover:shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/10">
                <Icon className="h-5 w-5 text-brand-accent-strong" strokeWidth={1.75} />
              </div>
              <h2 className="font-serif text-lg font-bold text-brand-text">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">{detail}</p>
              <p className="mt-3 text-sm font-medium text-brand-accent-strong underline underline-offset-2">
                {label}
              </p>
            </a>
            );
          })}
        </div>

        <Before />
      </div>
    </div>
  );
}
