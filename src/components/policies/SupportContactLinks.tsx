import { Mail, MessageCircle, Phone } from 'lucide-react';
import { config } from '@/lib/config';

/**
 * The three support channels, shared by the policy pages so a change of
 * number or address is one edit and cannot drift between languages.
 *
 * Only the WhatsApp label is copy; the address and number come from config.
 */
export function SupportContactLinks({ whatsappLabel }: { whatsappLabel: string }) {
  return (
    <div className="mt-4 space-y-3">
      <a
        href={`tel:${config.supportPhone}`}
        className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
      >
        <Phone className="h-4 w-4 shrink-0" />
        {config.supportPhoneDisplay}
      </a>
      <a
        href={`mailto:${config.supportEmail}`}
        className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
      >
        <Mail className="h-4 w-4 shrink-0" />
        {config.supportEmail}
      </a>
      <a
        href={config.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 text-sm text-brand-accent-strong transition-colors hover:underline"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        {whatsappLabel}
      </a>
    </div>
  );
}
