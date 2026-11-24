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

  test('draws the pictograms, pills and illustrations with names and shared patterns', async ({
    page,
  }) => {
    await page.goto('/styleguide');

    // Illustrations that carry meaning are named for screen readers.
    await expect(page.getByRole('img', { name: /^A medicine box/ })).toBeVisible();
    await expect(page.getByRole('img', { name: /^The four day colours/ })).toBeVisible();
    await expect(
      page.getByRole('img', { name: /drawn large over its 48-unit grid/ }),
    ).toBeVisible();

    // The 1 cm strip names all 21 marks; its black and white copy is decorative.
    const strip = page.getByText('At 1 cm, printed').locator('..');
    await expect(strip.getByRole('img')).toHaveCount(21);
    await expect(strip.getByRole('img', { name: 'Sunrise' })).toBeVisible();

    // Every pattern a pill refers to is defined exactly once in the page.
    const missing = await page.evaluate(() => {
      const ids = new Set([...document.querySelectorAll('pattern')].map((p) => p.id));
      const refs = [...document.querySelectorAll<SVGElement>('[style*="url(#wl-p-"]')].map(
        (el) => /#(wl-p-[\w-]+)/.exec(el.getAttribute('style') ?? '')?.[1] ?? '',
      );
      return refs.filter((ref) => !ids.has(ref));
    });
    expect(missing).toEqual([]);
    expect(await page.locator('pattern#wl-p-dots').count()).toBe(1);
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

  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    test(`fits ${String(width)}px wide with no sideways page scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/styleguide');
      // Overflow can appear only once the web fonts arrive, so measure after all three load.
      await expect
        .poll(() =>
          page.evaluate(
            () => [...document.fonts].filter((face) => face.status === 'loaded').length,
          ),
        )
        .toBeGreaterThanOrEqual(3);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }

  test('has no accessibility violations at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/styleguide');
    await expect(page.getByRole('heading', { level: 1, name: 'wordless' })).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
  });
});
