import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('styleguide', () => {
  test('renders with no console errors and no accessibility violations', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/styleguide');
    await expect(page.getByRole('heading', { level: 1, name: 'wordless' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Tokens' })).toBeVisible();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('loads all three fonts from the app itself, with font CDNs unreachable', async ({
    page,
  }) => {
    // Wordless must work offline: block the font CDNs entirely.
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await page.goto('/styleguide');

    // Faces load lazily, once text that uses them is on screen, so poll until they settle.
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.fonts]
            .filter((face) => face.status === 'loaded')
            .map((face) => face.family.replaceAll('"', ''))
            .sort(),
        ),
      )
      .toEqual(
        expect.arrayContaining(['Atkinson Hyperlegible Next Variable', 'Kalam', 'Young Serif']),
      );
  });

  test('skips animations when the user prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/styleguide');
    const motion = page.getByRole('region', { name: 'Motion' });
    await expect(motion).toBeVisible();

    const durations = await motion.locator('*').evaluateAll((els) =>
      els
        .map((el) => getComputedStyle(el))
        .filter((style) => style.animationName !== 'none')
        .map((style) => parseFloat(style.animationDuration)),
    );
    expect(durations.length).toBeGreaterThan(0);
    for (const seconds of durations) expect(seconds).toBeLessThan(0.001);
  });
});
