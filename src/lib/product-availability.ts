import type { Product, ProductVariation } from '@/lib/api/products';

export type ProductBadge = 'pre-order' | 'sold-out' | null;
export type HeroPrimaryAction = 'ready-stock' | 'pre-order' | 'contact';

const PRE_ORDER_TAG = 'pre-order';
const READY_STOCK_TAG = 'ready-stock';

export { PRE_ORDER_TAG, READY_STOCK_TAG };

function hasTag(product: Product, slug: string): boolean {
  return Array.isArray(product.tags) && product.tags.some((tag) => tag.slug === slug);
}

/** Full variation objects; the list endpoint only returns IDs. */
export function asVariationObjects(variations: Product['variations']): ProductVariation[] {
  return (variations as ProductVariation[]).filter(
    (variation): variation is ProductVariation => typeof variation === 'object',
  );
}

/** A variation can be bought when it is not out of stock. */
export function isVariationPurchasable(variation: ProductVariation): boolean {
  return variation.stock_status !== 'outofstock';
}

/** A pre-order product is bought ahead of the import window, not from ready stock. */
export function isPreOrder(product: Product): boolean {
  return hasTag(product, PRE_ORDER_TAG);
}

/**
 * Whether the product has stock a customer can buy right now.
 * The product-level stock status is the aggregate; full variation detail,
 * when present, is authoritative.
 */
export function hasPurchasableStock(product: Product): boolean {
  const variations = asVariationObjects(product.variations);
  if (product.type === 'variable' && variations.length > 0) {
    return variations.some(isVariationPurchasable);
  }

  if (!product.stock_status) return false;
  return product.stock_status !== 'outofstock';
}

/**
 * Whether a customer can buy the product right now.
 *
 * Pre-Order is a purchase mode, so it stays buyable regardless of stock status.
 */
export function isPurchasable(product: Product): boolean {
  if (isPreOrder(product)) return true;
  return hasPurchasableStock(product);
}

/** Ready Stock is a stock-backed view over the `ready-stock` tag. */
export function isReadyStock(product: Product): boolean {
  return hasTag(product, READY_STOCK_TAG) && hasPurchasableStock(product);
}

export function getProductBadge(product: Product): ProductBadge {
  if (isPreOrder(product)) return 'pre-order';
  if (!isPurchasable(product)) return 'sold-out';
  return null;
}

/**
 * What the home hero should offer when the Ready Stock collection is empty.
 * Pass the combined product set, or both collections together, so the
 * Pre-Order fallback can be seen.
 */
export function getHeroPrimaryAction(products: Product[]): HeroPrimaryAction {
  if (products.some(isReadyStock)) return 'ready-stock';
  if (products.some(isPreOrder)) return 'pre-order';
  return 'contact';
}
