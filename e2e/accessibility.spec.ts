import { test, expect } from '@playwright/test';

/**
 * Keyboard behaviour that no HTTP check can see.
 *
 * These run without a session: a visitor who never signs in is exactly who the
 * skip link is for.
 */
/**
 * Bengali conjuncts and floating vowel signs break apart under positive
 * letter-spacing: `tracking-[0.3em]` rendered প্রিমিয়াম as প্রি মি য়াম on the
 * live site, and every gate stayed green because none of them looked at CSS.
 * This walks the rendered page instead of the source, so any utility, inline
 * style or new component is covered.
 */
test.describe('Bangla typography', () => {
  test('no element adds letter-spacing to a Bangla page', async ({ page }) => {
    await page.context().addCookies([
      { name: 'locale', value: 'bn', url: 'http://127.0.0.1:3211' },
    ]);
    await page.goto('/');

    const tracked = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*'))
        .filter((element) => {
          if (!element.textContent?.trim()) return false;
          return getComputedStyle(element).letterSpacing !== 'normal';
        })
        .map((element) => `${element.tagName}: ${getComputedStyle(element).letterSpacing}`),
    );

    expect(tracked).toEqual([]);
  });

  test('English keeps its tracking, so the fix stays scoped', async ({ page }) => {
    await page.goto('/');
    const tracked = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).filter(
        (element) =>
          element.textContent?.trim() && getComputedStyle(element).letterSpacing !== 'normal',
      ).length,
    );
    // Not zero on the English page: the eyebrow uses tracking on purpose.
    expect(tracked).toBeGreaterThan(0);
  });
});

test.describe('keyboard entry', () => {
  test('the first Tab exposes a skip link that jumps to the main content', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /মূল কনটেন্টে যান|Skip to content/ });
    await expect(skip).toBeFocused();
    // Hidden until focused, which is the point: sighted users never see it.
    await expect(skip).toBeVisible();

    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('#main')).toBeVisible();
  });

  test('a page has exactly one main landmark', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toHaveCount(1);
  });
});
