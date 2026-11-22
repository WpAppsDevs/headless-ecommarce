/**
 * Staff dashboard API.
 *
 * The dashboard may not trust a role stored in the browser: WordPress decides,
 * and these calls carry that answer. Payloads are normalized at the boundary,
 * never cast.
 *
 * @see docs/architecture.md — route handlers are proxies, WordPress authorizes
 */

import { tokenCache } from './client';
import { ApiError } from '@/lib/errors';

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

/**
 * Call a route on this site, never WordPress.
 *
 * The dashboard is authenticated: the bearer token must not leave for
 * WordPress from the browser, and a cross-origin call would depend on CORS.
 * `/api/staff/*` forwards the token server-side, exactly like every other
 * authenticated surface.
 */
async function staffFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  return parseResponse(await fetchStaff(path, init));
}

/**
 * The whole envelope, for endpoints that paginate.
 *
 * WordPress answers a collection as `{ success, data: [...], meta: { page,
 * per_page, total, total_pages } }`. The meta is outside `data`, so a caller
 * that unwraps first loses the counts — which reads as "no products".
 */
async function staffEnvelope(
  path: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
  const json = await readJson(await fetchStaff(path, init));

  return isRecord(json) ? json : {};
}

async function fetchStaff(path: string, init: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: { ...(init.headers ?? {}), ...authHeader() },
  });
}

/** Whether this token may open the staff dashboard. Throws on failure. */
export async function getStaffAccess(): Promise<StaffAccess> {
  return normalizeAccess(await staffFetch('/api/staff/access'));
}

/** Categories, tags, brands, availability ids and the form limits. */
export async function getStaffOptions(): Promise<StaffOptions> {
  return normalizeOptions(await staffFetch('/api/staff/options'));
}


export interface StaffImage {
  id: number;
  url: string;
  alt: string;
  mimeType: string;
  width: number;
  height: number;
}

export interface StaffProduct {
  id: number;
  name: string;
  status: string;
  sku: string;
  regularPrice: string;
  salePrice: string;
  price: string;
  stockStatus: string;
  stockQuantity: number | null;
  manageStock: boolean;
  backorders: string;
  availability: string;
  categories: StaffTerm[];
  brands: StaffTerm[];
  tags: StaffTerm[];
  image: StaffImage | null;
  gallery: StaffImage[];
  authorId: number;
  description: string;
  canEdit: boolean;
}

export interface StaffProductPage {
  items: StaffProduct[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface StaffProductPayload {
  name: string;
  description: string;
  regular_price: string;
  sell_price: string;
  sku: string;
  stock_mode: 'managed' | 'status';
  stock_quantity: number;
  backorders: string;
  stock_status: string;
  category_ids: number[];
  brand_ids: number[];
  tag_ids: number[];
  availability: string;
  image_id: number;
  gallery_ids: number[];
  status: 'draft' | 'publish';
}

export function normalizeStaffImage(raw: unknown): StaffImage {
  const image = isRecord(raw) ? raw : {};

  return {
    id: asNumber(image.id),
    url: asString(image.url),
    alt: asString(image.alt),
    mimeType: asString(image.mime_type),
    width: asNumber(image.width),
    height: asNumber(image.height),
  };
}

function normalizeStaffImages(raw: unknown): StaffImage[] {
  return Array.isArray(raw) ? raw.map(normalizeStaffImage) : [];
}

function normalizeStaffProduct(raw: unknown): StaffProduct {
  const product = isRecord(raw) ? raw : {};
  const image = isRecord(product.image) ? normalizeStaffImage(product.image) : null;

  return {
    id: asNumber(product.id),
    name: asString(product.name),
    status: asString(product.status),
    sku: asString(product.sku),
    regularPrice: asString(product.regular_price),
    salePrice: asString(product.sale_price),
    price: asString(product.price),
    stockStatus: asString(product.stock_status, 'instock'),
    stockQuantity: asNullableNumber(product.stock_quantity),
    manageStock: asBoolean(product.manage_stock),
    backorders: asString(product.backorders, 'no'),
    availability: asString(product.availability),
    categories: normalizeTerms(product.categories),
    brands: normalizeTerms(product.brands),
    tags: normalizeTerms(product.tags),
    image,
    gallery: normalizeStaffImages(product.gallery),
    authorId: asNumber(product.author_id),
    description: asString(product.description),
    canEdit: asBoolean(product.can_edit, true),
  };
}

function authHeader(): Record<string, string> {
  const token = tokenCache.get();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrap(json: unknown): unknown {
  return isRecord(json) && 'data' in json ? json.data : json;
}

/** Parse a proxy response, turning both error shapes into an ApiError. */
async function parseResponse(res: Response): Promise<unknown> {
  return unwrap(await readJson(res));
}

/** Parse a proxied response once, turning both error shapes into an ApiError. */
async function readJson(res: Response): Promise<unknown> {
  const json: unknown = await res.json().catch(() => null);
  const failure = isRecord(json) && json.success === false ? json : null;

  if (failure) {
    throw new ApiError(
      asString(failure.code, 'api_error'),
      asString(failure.message, `HTTP ${res.status}`),
    );
  }

  if (!res.ok) {
    const error = isRecord(json) ? json : {};
    throw new ApiError(asString(error.code, 'http_error'), asString(error.message, `HTTP ${res.status}`));
  }

  return json;
}

/** Upload one product image. Resolves with the attachment the product will reference. */
export async function uploadStaffImage(file: File, alt = ''): Promise<StaffImage> {
  const form = new FormData();
  form.append('file', file);

  if (alt) form.append('alt', alt);

  // No Content-Type: the browser adds the multipart boundary.
  const res = await fetch('/api/staff/media', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });

  return normalizeStaffImage(await parseResponse(res));
}

export async function deleteStaffImage(id: number): Promise<void> {
  await parseResponse(
    await fetch(`/api/staff/media/${id}`, { method: 'DELETE', headers: authHeader() }),
  );
}

export async function updateStaffImageAlt(id: number, alt: string): Promise<StaffImage> {
  const res = await fetch(`/api/staff/media/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ alt }),
  });

  return normalizeStaffImage(await parseResponse(res));
}

export interface StaffProductQuery {
  page?: number;
  perPage?: number;
  status?: 'publish' | 'draft' | 'trash';
  search?: string;
}

export async function listStaffProducts(query: StaffProductQuery = {}): Promise<StaffProductPage> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.perPage) params.set('per_page', String(query.perPage));
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);

  return normalizeStaffProductPage(
    await staffEnvelope(`/api/staff/products?${params.toString()}`),
  );
}

/**
 * Read a product page from either envelope WordPress has used.
 *
 * Current: `{ data: [...], meta: { total, total_pages } }`. Older plugin
 * builds nested the pagination inside `data`. Both are accepted so a plugin
 * rollback does not empty the dashboard.
 */
export function normalizeStaffProductPage(json: unknown): StaffProductPage {
  const envelope = isRecord(json) ? json : {};
  const data = envelope.data;
  const meta = isRecord(envelope.meta) ? envelope.meta : isRecord(data) ? data : {};
  const rawItems = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.items)
      ? data.items
      : [];

  return {
    items: rawItems.map(normalizeStaffProduct),
    total: asNumber(meta.total),
    page: asNumber(meta.page, 1),
    perPage: asNumber(meta.per_page, 20),
    totalPages: asNumber(meta.total_pages),
  };
}

export async function getStaffProduct(id: number): Promise<StaffProduct> {
  return normalizeStaffProduct(await staffFetch(`/api/staff/products/${id}`));
}

export async function createStaffProduct(
  payload: StaffProductPayload,
  idempotencyKey: string,
): Promise<StaffProduct> {
  const res = await fetch('/api/staff/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });

  return normalizeStaffProduct(await parseResponse(res));
}

export async function updateStaffProduct(
  id: number,
  payload: StaffProductPayload,
): Promise<StaffProduct> {
  const res = await fetch(`/api/staff/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });

  return normalizeStaffProduct(await parseResponse(res));
}

export async function trashStaffProduct(id: number): Promise<void> {
  await parseResponse(
    await fetch(`/api/staff/products/${id}`, { method: 'DELETE', headers: authHeader() }),
  );
}
