import { create } from 'zustand';

export type CurrencyPosition = 'left' | 'right' | 'left_space' | 'right_space';

interface CurrencyState {
  code: string;
  symbol: string;
  position: CurrencyPosition;
  decimals: number;
  decimalSep: string;
  thousandsSep: string;
  hydrated: boolean;
}

interface CurrencyActions {
  hydrate: () => Promise<void>;
}

const DEFAULTS: Omit<CurrencyState, 'hydrated'> = {
  code: 'USD',
  symbol: '$',
  position: 'left',
  decimals: 2,
  decimalSep: '.',
  thousandsSep: ',',
};

export const useCurrencyStore = create<CurrencyState & CurrencyActions>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const res = await fetch('/api/store-settings', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      const c = json?.data?.currency;
      if (!c) return;
      set({
        code:         c.code         ?? DEFAULTS.code,
        symbol:       c.symbol       ?? DEFAULTS.symbol,
        position:     c.position     ?? DEFAULTS.position,
        decimals:     c.decimals     ?? DEFAULTS.decimals,
        decimalSep:   c.decimal_separator   ?? DEFAULTS.decimalSep,
        thousandsSep: c.thousands_separator ?? DEFAULTS.thousandsSep,
        hydrated: true,
      });
    } catch {
      // Silently fall back to defaults — app remains functional
      set({ hydrated: true });
    }
  },
}));
