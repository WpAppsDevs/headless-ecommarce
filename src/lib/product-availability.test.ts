import { describe, expect, it } from 'vitest';
import type { Product, ProductTag, ProductVariation } from '@/lib/api/products';
import {
  getHeroPrimaryAction,
  getProductBadge,
  isPreOrder,
  isPurchasable,
  isReadyStock,
  isVariationPurchasable,
  type HeroPrimaryAction,
} from '@/lib/product-availability';

function tag(slug: string): ProductTag {
  return { id: 1, name: slug, slug };
}

function variation(id: number, stock_status: ProductVariation['stock_status']): ProductVariation {
  return {
    id,
    sku: `SKU-${id}`,
    price: '100',
    regular_price: '100',
    sale_price: '',
    on_sale: false,
    stock_status,
    stock_quantity: null,
    manage_stock: false,
    attributes: {},
    image: '',
  };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Test product',
    slug: 'test-product',
    type: 'simple',
    price: '100',
    regular_price: '100',
    sale_price: '',
    on_sale: false,
    stock_status: 'instock',
    stock_quantity: null,
    categories: [],
    images: [],
    attributes: [],
    variations: [],
    tags: [],
    ...overrides,
  };
}

describe('product availability', () => {
  const cases: Array<{
    name: string;
    product: Product;
    purchasable: boolean;
    readyStock: boolean;
    badge: 'pre-order' | 'sold-out' | null;
    hero: HeroPrimaryAction;
  }> = [
    {
      name: 'a simple product in stock and tagged ready stock',
      product: product({ tags: [tag('ready-stock')] }),
      purchasable: true,
      readyStock: true,
      badge: null,
      hero: 'ready-stock',
    },
    {
      name: 'a simple product that is sold out',
      product: product({ stock_status: 'outofstock', tags: [tag('ready-stock')] }),
      purchasable: false,
      readyStock: false,
      badge: 'sold-out',
      hero: 'contact',
    },
    {
      name: 'a simple product in stock but not in the ready stock collection',
      product: product(),
      purchasable: true,
      readyStock: false,
      badge: null,
      hero: 'contact',
    },
    {
      name: 'a variable product with one purchasable variation',
      product: product({
        type: 'variable',
        stock_status: 'outofstock',
        variations: [variation(1, 'instock'), variation(2, 'outofstock')],
        tags: [tag('ready-stock')],
      }),
      purchasable: true,
      readyStock: true,
      badge: null,
      hero: 'ready-stock',
    },
    {
      name: 'a variable product with every variation sold out',
      product: product({
        type: 'variable',
        stock_status: 'instock',
        variations: [variation(1, 'outofstock'), variation(2, 'outofstock')],
        tags: [tag('ready-stock')],
      }),
      purchasable: false,
      readyStock: false,
      badge: 'sold-out',
      hero: 'contact',
    },
    {
      name: 'a pre-order product whose stock status is out of stock',
      product: product({ stock_status: 'outofstock', tags: [tag('pre-order')] }),
      purchasable: true,
      readyStock: false,
      badge: 'pre-order',
      hero: 'pre-order',
    },
    {
      name: 'a pre-order product that is also tagged ready stock',
      product: product({ stock_status: 'instock', tags: [tag('pre-order'), tag('ready-stock')] }),
      purchasable: true,
      readyStock: true,
      badge: 'pre-order',
      hero: 'ready-stock',
    },
    {
      name: 'an out-of-stock pre-order product that is also tagged ready stock',
      product: product({ stock_status: 'outofstock', tags: [tag('pre-order'), tag('ready-stock')] }),
      purchasable: true,
      readyStock: false,
      badge: 'pre-order',
      hero: 'pre-order',
    },
    {
      name: 'a variable product in the list shape with variation ids and an in-stock aggregate',
      product: product({
        type: 'variable',
        stock_status: 'instock',
        variations: [1, 2],
        tags: [tag('ready-stock')],
      }),
      purchasable: true,
      readyStock: true,
      badge: null,
      hero: 'ready-stock',
    },
    {
      name: 'a product with missing stock status',
      product: product({ stock_status: undefined as unknown as Product['stock_status'] }),
      purchasable: false,
      readyStock: false,
      badge: 'sold-out',
      hero: 'contact',
    },
    {
      name: 'a variable product with no variations falls back to product stock',
      product: product({ type: 'variable', stock_status: 'instock', tags: [tag('ready-stock')] }),
      purchasable: true,
      readyStock: true,
      badge: null,
      hero: 'ready-stock',
    },
  ];

  it.each(cases)('$name', ({ product: entry, purchasable, readyStock, badge, hero }) => {
    expect(isPurchasable(entry)).toBe(purchasable);
    expect(isReadyStock(entry)).toBe(readyStock);
    expect(getProductBadge(entry)).toBe(badge);
    expect(getHeroPrimaryAction([entry])).toBe(hero);
  });

  it('treats a backordered variation as purchasable', () => {
    expect(isVariationPurchasable(variation(1, 'onbackorder'))).toBe(true);
    expect(isVariationPurchasable(variation(2, 'outofstock'))).toBe(false);
  });

  it('detects the pre-order purchase mode from tags', () => {
    expect(isPreOrder(product({ tags: [tag('pre-order')] }))).toBe(true);
    expect(isPreOrder(product({ tags: [tag('ready-stock')] }))).toBe(false);
  });
});

describe('hero primary action', () => {
  it('prefers ready stock when a purchasable ready-stock product exists', () => {
    expect(getHeroPrimaryAction([product({ tags: [tag('ready-stock')] })])).toBe('ready-stock');
  });

  it('falls back to pre-order when ready stock is empty', () => {
    expect(
      getHeroPrimaryAction([
        product({ stock_status: 'outofstock', tags: [tag('ready-stock')] }),
        product({ tags: [tag('pre-order')] }),
      ]),
    ).toBe('pre-order');
  });

  it('falls back to contact when both collections are empty', () => {
    expect(getHeroPrimaryAction([product({ stock_status: 'outofstock', tags: [tag('ready-stock')] })])).toBe('contact');
  });
});
