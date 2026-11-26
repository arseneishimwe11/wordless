import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { collectErrors } from './helpers';

/** Counts the pages in a PDF Chromium has made. */
const pdfPages = (pdf: Buffer) =>
  (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;

const WIDTHS = [1024, 1280, 1440];

async function noSidewaysScroll(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, label).toBeLessThanOrEqual(0);
}

/**
 * No axe violations. The live sheet is a scaled picture of the printed page (hidden from
 * screen readers; its words are in the list beside it), so its faint "how long?" note is
 * incidental text under WCAG 1.4.3: everything else is checked there too.
 */
async function noViolations(page: Page, label: string) {
  const preview = '[aria-label="Live preview of the printed sheet"] [aria-hidden="true"]';
  const page_ = await new AxeBuilder({ page }).exclude(preview).analyze();
  expect(page_.violations, label).toEqual([]);
  if ((await page.locator(preview).count()) === 0) return;
  const picture = await new AxeBuilder({ page })
    .include(preview)
    .disableRules(['color-contrast'])
    .analyze();
  expect(picture.violations, `${label}: live sheet`).toEqual([]);
}

const title = (page: Page) => page.getByRole('heading', { level: 1 });
const liveSheet = (page: Page) =>
  page.getByRole('complementary', { name: 'Live preview of the printed sheet' });

for (const width of WIDTHS) {
  test.describe(`desktop at ${String(width)}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('a whole medicine by keyboard alone, the sheet redrawing as it goes', async ({ page }) => {
      const errors = collectErrors(page);
      // Colour transitions would otherwise be caught half way by axe.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.getByRole('button', { name: 'New schedule' }).click();

      await expect(title(page)).toHaveText('What is the medicine?');
      await expect(page.getByLabel(/Medicine name/)).toBeFocused();
      await page.keyboard.type('Amoxicillin 500 mg');
      await expect(liveSheet(page).getByText('Amoxicillin 500 mg · being entered')).toBeVisible();
      await noSidewaysScroll(page, 'medicine');
      await noViolations(page, 'medicine');
      await page.keyboard.press('Enter');

      await expect(title(page)).toHaveText('When does it go in?');
      await page.keyboard.press('Enter');
      await expect(page.getByText('Add at least one time first')).toBeVisible();
      await expect(title(page)).toHaveText('When does it go in?');
      await page.keyboard.press('3');
      await expect(page.getByText('Sunrise, midday and sunset').first()).toBeVisible();
      await expect(liveSheet(page).getByText('?', { exact: true })).toHaveCount(0);
      await noSidewaysScroll(page, 'when');
      await noViolations(page, 'when');
      await page.keyboard.press('Enter');

      await expect(title(page)).toHaveText('For how long?');
      await page.keyboard.type('7');
      await expect(page.getByText('7 days · 21 doses in all')).toBeVisible();
      await noViolations(page, 'how long');
      await page.keyboard.press('Enter');

      await expect(title(page)).toHaveText('Anything else it says?');
      // Each step starts at its first field.
      await expect(page.getByRole('checkbox', { name: 'With food' })).toBeFocused();
      await page.keyboard.press('Space');
      await expect(page.getByRole('checkbox', { name: 'With food' })).toBeChecked();
      await page.keyboard.press('Enter');

      await expect(page.getByRole('status')).toContainText(
        'Amoxicillin 500 mg has been added for Person A.',
      );
      await expect(liveSheet(page).getByText('being entered')).toHaveCount(0);
      await noSidewaysScroll(page, 'added');
      await noViolations(page, 'added');
      await expect(page.getByRole('button', { name: /Print preview/ })).toBeFocused();
      await page.keyboard.press('Enter');

      await expect(title(page)).toHaveText('Print');
      await noSidewaysScroll(page, 'print');
      await noViolations(page, 'print');
      expect(errors).toEqual([]);
    });

    test('Shift + Enter steps back, and the rail jumps between steps', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'New schedule' }).click();
      await expect(page.getByLabel(/Medicine name/)).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(title(page)).toHaveText('When does it go in?');
      await page.keyboard.press('Shift+Enter');
      await expect(title(page)).toHaveText('What is the medicine?');
      await page
        .getByRole('navigation', { name: 'Steps' })
        .getByRole('button', { name: /Rules/ })
        .click();
      await expect(title(page)).toHaveText('Anything else it says?');
    });
  });
}

test.describe('desktop printing', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('both printables, two copies: four A4 pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New schedule' }).click();
    await page.getByLabel(/Medicine name/).fill('Amoxicillin 500 mg');
    await page.keyboard.press('Enter');
    await expect(title(page)).toHaveText('When does it go in?');
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');
    await expect(title(page)).toHaveText('For how long?');
    await page.keyboard.type('7');
    await page.keyboard.press('Enter');
    await expect(title(page)).toHaveText('Anything else it says?');
    await page.getByRole('button', { name: /Add to the sheet/ }).click();
    await page.getByRole('button', { name: /Print preview/ }).click();

    await page.getByRole('radio', { name: /^Both/ }).dispatchEvent('click');
    await page.getByRole('button', { name: 'One more copy' }).click();
    await expect(page.getByRole('button', { name: /Print 2 copies/ })).toBeVisible();

    // As the print dialog sees it: print media, A4 wide. The choices must survive that.
    await page.emulateMedia({ media: 'print' });
    await page.setViewportSize({ width: 794, height: 1123 });
    await expect(page.locator('.screenOnly')).toBeHidden();
    await expect(page.locator('.printOnly [data-page]')).toHaveCount(4);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    expect(pdfPages(pdf)).toBe(4);
  });
});
