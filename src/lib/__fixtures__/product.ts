import type { Product, ProductTag, ProductVariation } from '@/lib/api/products';

export function tag(slug: string): ProductTag {
  return { id: 1, name: slug, slug };
}

export function variation(
  id: number,
  stock_status: ProductVariation['stock_status'],
): ProductVariation {
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

export function product(overrides: Partial<Product> = {}): Product {
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
