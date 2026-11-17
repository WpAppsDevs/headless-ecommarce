import { test, expect } from '@playwright/test';

/**
 * Keyboard behaviour that no HTTP check can see.
 *
 * These run without a session: a visitor who never signs in is exactly who the
 * skip link is for.
 */
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
