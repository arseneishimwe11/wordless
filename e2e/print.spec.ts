import { createRequire } from 'node:module';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { decodeSchedule } from '../src/domain/codec/schedule';
import { addParacetamol, collectErrors, enterAmoxicillin, pick } from './helpers';

const require = createRequire(import.meta.url);

/** Counts the pages in a PDF Chromium has made. */
const pdfPages = (pdf: Buffer) =>
  (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;

async function openPrint(page: Page) {
  await page.getByRole('link', { name: 'Print the sheet' }).click();
  await expect(page.getByRole('heading', { name: 'Print' })).toBeVisible();
}

/** Switches the page to print media at A4 width, as the print dialog sees it. */
async function asPrinted(page: Page) {
  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: 794, height: 1123 });
}

test.describe('printing', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the Print screen: no accessibility violations or console errors', async ({ page }) => {
    const errors = collectErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enterAmoxicillin(page);
    await addParacetamol(page);
    await openPrint(page);
    const axe = await new AxeBuilder({ page }).include('.screenOnly').analyze();
    expect(axe.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('only the A4 pages print, one page for the design’s example', async ({ page }) => {
    await enterAmoxicillin(page);
    await addParacetamol(page);
    await openPrint(page);
    await asPrinted(page);
    await expect(page.locator('.screenOnly')).toBeHidden();
    const pages = page.locator('.printOnly section');
    await expect(pages).toHaveCount(1);
    expect(await pages.first().evaluate((el) => el.getBoundingClientRect().width)).toBe(794);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    expect(pdfPages(pdf)).toBe(1);
  });

  test('daily strips print too, and the choice is remembered', async ({ page }) => {
    await enterAmoxicillin(page);
    await openPrint(page);
    await pick(page, 'radio', 'Daily strips');
    await pick(page, 'radio', 'Black & white');
    await page.waitForTimeout(300); // let the choice reach IndexedDB
    await page.reload();
    await expect(page.getByRole('radio', { name: 'Daily strips' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Black & white' })).toBeChecked();
    await asPrinted(page);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    expect(pdfPages(pdf)).toBe(1);
  });

  test('a long schedule continues on more pages', async ({ page }) => {
    await enterAmoxicillin(page);
    for (const name of ['Second', 'Third', 'Fourth']) {
      await page.getByRole('link', { name: 'Add a medicine' }).click();
      await page.getByLabel('Medicine name').fill(name);
      await page.getByRole('button', { name: 'Next: when' }).click();
      await page
        .getByRole('radiogroup', { name: 'Times a day' })
        .getByRole('radio', { name: '3' })
        .dispatchEvent('click');
      await page.getByRole('button', { name: 'Next: how long' }).click();
      await pick(page, 'radio', '14');
      await page.getByRole('button', { name: 'Next: rules' }).click();
      await page.getByRole('button', { name: 'Done: see the schedule' }).click();
    }
    await openPrint(page);
    await asPrinted(page);
    const count = await page.locator('.printOnly section').count();
    expect(count).toBeGreaterThan(1);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    expect(pdfPages(pdf)).toBe(count);
  });

  test('the printed code scans back into the same schedule', async ({ page }) => {
    await enterAmoxicillin(page);
    await addParacetamol(page);
    await openPrint(page);
    await asPrinted(page);
    // Read the code from pixels, as a phone camera would: screenshot it, then scan it.
    const frame = page
      .locator('.printOnly')
      .getByRole('img', { name: 'QR code holding this whole schedule' })
      .locator('..');
    const png = await frame.screenshot();
    await page.addScriptTag({ path: require.resolve('jsqr/dist/jsQR.js') });
    const text = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const scan = (
        window as unknown as {
          jsQR: (d: Uint8ClampedArray, w: number, h: number) => { data: string } | null;
        }
      ).jsQR;
      return scan(data, canvas.width, canvas.height)?.data ?? null;
    }, png.toString('base64'));

    expect(text).toMatch(/^WL1:/);
    const decoded = decodeSchedule(text ?? '');
    if (!decoded.ok) throw new Error(decoded.error);
    expect(decoded.person.mark).toBe('a');
    expect(decoded.person.medicines.map((m) => [m.name, m.form, m.timing.mode])).toEqual([
      ['Amoxicillin 500 mg', 'capsule', 'fixed'],
      ['Paracetamol', 'tablet', 'whenNeeded'],
    ]);
  });
});
