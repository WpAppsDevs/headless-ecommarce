import { test, expect, type Page } from '@playwright/test';

/**
 * The staff dashboard, end to end.
 *
 * The staff account is provisioned in WordPress with the `ns_staff` role
 * ("NS Shop Staff"), so credentials come from the environment and never live here:
 *
 *   E2E_STAFF_EMAIL=… E2E_STAFF_PASSWORD=… npm run test:e2e
 *
 * With either one missing the file skips. It creates a real draft product and
 * trashes it at the end, so a run leaves the shop as it found it — except for
 * an image in the media library, which the daily orphan sweep removes.
 */
const EMAIL = process.env.E2E_STAFF_EMAIL;
const PASSWORD = process.env.E2E_STAFF_PASSWORD;

test.skip(!EMAIL || !PASSWORD, 'E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD are not set');

/** A 1×1 PNG, so the upload path is exercised without a fixture file. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const COPY = {
  username: 'Email or username',
  password: 'Password',
  signIn: 'Sign in',
  newProduct: 'New product',
  name: 'Product name',
  regular: 'Regular price',
  sell: 'Sell price',
  drafts: 'Drafts',
  save: 'Save product',
  trash: 'Trash',
  confirmTrash: 'Move to trash',
};

async function signIn(page: Page) {
  await page.context().addCookies([
    { name: 'locale', value: 'en', url: 'http://127.0.0.1:3211' },
  ]);
  await page.goto('/login?redirect=/studio');
  await page.getByLabel(COPY.username).fill(EMAIL!);
  await page.getByLabel(COPY.password).fill(PASSWORD!);
  await page.getByRole('button', { name: COPY.signIn }).click();
  await expect(page).toHaveURL(/\/studio$/);
}

test.describe.serial('staff dashboard', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await signIn(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('the dashboard and the product list open behind the staff door', async () => {
    await expect(page.getByRole('heading', { name: 'NS Studio' })).toBeAttached();
    await expect(page.getByRole('link', { name: COPY.newProduct })).toBeVisible();

    await page.getByRole('button', { name: 'Products' }).first().click();
    await expect(page).toHaveURL(/\/studio\/products$/);
    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
  });

  test('a product is created as a draft and appears under Drafts', async () => {
    const name = `E2E staff product ${Date.now()}`;

    await page.getByRole('link', { name: COPY.newProduct }).click();
    await expect(page).toHaveURL(/\/studio\/products\/new/);

    await page.getByLabel(COPY.name).fill(name);
    await page.getByLabel(COPY.regular).fill('1500');
    await page.getByLabel(COPY.sell).fill('1200');

    // The first category is enough; the plugin requires at least one.
    await page.locator('label:has(input[type="checkbox"])').first().click();

    // Featured image: the first file input on the form.
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'e2e-product.png',
      mimeType: 'image/png',
      buffer: PNG,
    });

    await expect(page.locator('img[alt=""]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: COPY.save }).click();

    await expect(page).toHaveURL(/\/studio\/products$/, { timeout: 15_000 });
    await expect(page.getByText('Product created.')).toBeVisible();

    await page.getByRole('button', { name: COPY.drafts }).click();
    await expect(page.getByText(name)).toBeVisible();
  });

  test('a draft can be moved to the trash', async () => {
    await page.getByRole('button', { name: COPY.drafts }).click();

    const row = page.locator('li', { hasText: 'E2E staff product' }).first();

    await row.getByRole('button', { name: COPY.trash }).click();
    await row.getByRole('button', { name: COPY.confirmTrash }).click();

    await expect(page.getByText('Product moved to the trash.')).toBeVisible();
    await expect(row).toHaveCount(0);
  });
});
