/**
 * Staff dashboard API.
 *
 * The dashboard may not trust a role stored in the browser: WordPress decides,
 * and these calls carry that answer. Payloads are normalized at the boundary,
 * never cast.
 *
 * @see docs/architecture.md — route handlers are proxies, WordPress authorizes
 */

import { apiClient } from './client';

export interface StaffAccess {
  allowed: boolean;
  canPublish: boolean;
  canEditOthers: boolean;
}

export interface StaffTerm {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
}

export interface StaffOptions {
  categories: StaffTerm[];
  tags: StaffTerm[];
  brands: StaffTerm[];
  availability: {
    readyStock: number | null;
    preOrder: number | null;
  };
  stock: {
    manageStock: boolean;
  };
  currency: {
    code: string;
    symbol: string;
  };
  limits: {
    gallery: number;
    maxFileMb: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeAccess(raw: unknown): StaffAccess {
  const data = isRecord(raw) ? raw : {};

  return {
    allowed: asBoolean(data.allowed),
    canPublish: asBoolean(data.can_publish),
    canEditOthers: asBoolean(data.can_edit_others),
  };
}

function normalizeTerm(raw: unknown): StaffTerm {
  const term = isRecord(raw) ? raw : {};

  return {
    id: asNumber(term.id),
    name: asString(term.name),
    slug: asString(term.slug),
    parent: asNumber(term.parent),
    count: asNumber(term.count),
  };
}

function normalizeTerms(raw: unknown): StaffTerm[] {
  return Array.isArray(raw) ? raw.map(normalizeTerm) : [];
}

function normalizeOptions(raw: unknown): StaffOptions {
  const data = isRecord(raw) ? raw : {};
  const availability = isRecord(data.availability) ? data.availability : {};
  const stock = isRecord(data.stock) ? data.stock : {};
  const currency = isRecord(data.currency) ? data.currency : {};
  const limits = isRecord(data.limits) ? data.limits : {};

  return {
    categories: normalizeTerms(data.categories),
    tags: normalizeTerms(data.tags),
    brands: normalizeTerms(data.brands),
    availability: {
      readyStock: asNullableNumber(availability['ready-stock']),
      preOrder: asNullableNumber(availability['pre-order']),
    },
    stock: { manageStock: asBoolean(stock.manage_stock) },
    currency: {
      code: asString(currency.code),
      symbol: asString(currency.symbol),
    },
    limits: {
      gallery: asNumber(limits.gallery, 6),
      maxFileMb: asNumber(limits.max_file_mb, 5),
    },
  };
}

/** Whether this token may open the staff dashboard. Throws on failure. */
export async function getStaffAccess(): Promise<StaffAccess> {
  return normalizeAccess(await apiClient<unknown>('/api/staff/access'));
}

/** Categories, tags, brands, availability ids and the form limits. */
export async function getStaffOptions(): Promise<StaffOptions> {
  return normalizeOptions(await apiClient<unknown>('/api/staff/options'));
}
