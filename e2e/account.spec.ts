import { test, expect, type Page } from '@playwright/test';

/**
 * The screens behind the login, which `check:routes` cannot reach.
 *
 * Credentials come from the environment so they never live in the repository:
 *
 *   E2E_EMAIL=… E2E_PASSWORD=… npm run test:e2e
 *
 * With either one missing the whole file skips, so a checkout without the
 * secret stays green rather than failing for the wrong reason.
 */
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASSWORD, 'E2E_EMAIL and E2E_PASSWORD are not set');

const BANGLA = {
  tabs: ['ড্যাশবোর্ড', 'আপনার অর্ডার', 'উইশলিস্ট', 'আমার ঠিকানা', 'সেটিংস'],
  orderId: /অর্ডার আইডি/,
  viewDetails: 'বিস্তারিত দেখুন',
  detailsTitle: 'অর্ডারের বিস্তারিত',
  printInvoice: 'ইনভয়েস প্রিন্ট করুন',
  signIn: 'সাইন ইন',
};

/** Logs in and leaves the browser on the account dashboard, in Bangla. */
async function signIn(page: Page) {
  await page.context().addCookies([
    { name: 'locale', value: 'bn', url: 'http://127.0.0.1:3211' },
  ]);
  await page.goto('/login');
  await page.fill('#username', EMAIL!);
  await page.fill('#password', PASSWORD!);
  await page.getByRole('button', { name: BANGLA.signIn }).click();
  await expect(page).toHaveURL(/\/account/);
}

test.describe.serial('account screens', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await signIn(page);
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('every account tab is labelled in Bangla', async () => {
    for (const label of BANGLA.tabs) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'সাইন আউট' })).toBeVisible();
  });

  test('an order card shows Bangla labels, not raw API fields', async () => {
    await page.getByRole('button', { name: 'আপনার অর্ডার' }).click();

    // Existence, not a count: the account's orders change in WordPress.
    const cards = page.getByText(BANGLA.orderId).first();
    await expect(cards).toBeVisible();

    const body = page.locator('main, body').first();
    await expect(body).toContainText('অর্ডার আইডি');
    // The compact card prints a formatted date, not the old "Date:" label.
    await expect(body).toContainText('বিস্তারিত দেখুন');
    // The English labels the card used to print.
    await expect(body).not.toContainText('Amount:');
    await expect(body).not.toContainText('Payment:');
  });

  test('order details open with Bangla headings and actions', async () => {
    await page.getByRole('button', { name: BANGLA.viewDetails }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('heading', { name: BANGLA.detailsTitle })).toBeVisible();
    await expect(page.getByRole('button', { name: BANGLA.printInvoice })).toBeVisible();

    // Focus starts inside the dialog, and Tab never leaves it.
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      await expect
        .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
        .toBe(true);
    }
    // The return action appears only for a completed order, so assert the
    // English label is gone rather than requiring a status this account may not have.
    // The modal is a plain fixed overlay, not a role="dialog", so match the
    // panel that holds the invoice actions instead of a landmark that is absent.
    const modal = page.locator('div.fixed.inset-0').last();
    await expect(modal).not.toContainText('Print Invoice');
    await expect(modal).not.toContainText('Download Invoice');

    // Escape closes it and hands focus back to the button that opened it, then the
    // tests share one page in serial order and an open overlay would swallow the
    // next test's clicks.
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(page.getByRole('button', { name: BANGLA.viewDetails }).first()).toBeFocused();
  });

  test('the language flag switches copy without dropping the session', async () => {
    await page.goto('/account');
    await page.getByRole('button', { name: /ভাষা পরিবর্তন/ }).click();

    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole('button', { name: /Switch language/ })).toBeVisible();
  });
});

test.describe('checkout validation', () => {
  test('an empty form names the missing fields in Bangla', async ({ page }) => {
    await page.context().addCookies([
      { name: 'locale', value: 'bn', url: 'http://127.0.0.1:3211' },
    ]);
    await signIn(page);

    // The checkout shell needs a cart and the catalogue is live data: walk the
    // shop until a product can actually be bought, and skip rather than fail if
    // none can today. Hard-coding a slug would rot the day that product retires.
    await page.goto('/products');
    const hrefs = [
      ...new Set(
        (await page.locator('a[href^="/products/"]').evaluateAll((els) =>
          els.map((el) => el.getAttribute('href') ?? ''),
        )).filter(Boolean),
      ),
    ].slice(0, 8);

    let added = false;
    for (const href of hrefs) {
      await page.goto(href);
      const addToCart = page.getByRole('button', { name: 'কার্টে যোগ করুন' });
      if (!(await addToCart.isVisible().catch(() => false))) continue;
      if (!(await addToCart.isEnabled().catch(() => false))) continue;

      const colour = page.locator('button[aria-label^="রং "]').first();
      if (await colour.isVisible().catch(() => false)) await colour.click();

      const size = page.locator('button[aria-pressed="false"]').first();
      if (await size.isVisible().catch(() => false)) {
        await size.click().catch(() => {});
      }

      await addToCart.click();
      await expect(page.getByRole('button', { name: /কার্ট — [1-9]/ })).toBeVisible();
      added = true;
      break;
    }

    test.skip(!added, 'no in-stock product could be added to the cart');

    await page.goto('/checkout');
    await page.getByRole('button', { name: 'অর্ডার দিন' }).click();

    await expect(page.getByText(/বাকি আছে:/)).toBeVisible();
  });
});
