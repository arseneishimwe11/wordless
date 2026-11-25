import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Picks a styled radio or checkbox (the native input sits under its drawn face). */
const pick = (page: Page, role: 'radio' | 'checkbox', name: string) =>
  page.getByRole(role, { name, exact: true }).dispatchEvent('click');

/** Enters the design's main example, Amoxicillin 3 a day for 7 days with food, by clicking. */
async function enterAmoxicillin(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'New schedule' }).click();
  await page.getByLabel('Medicine name').fill('Amoxicillin 500 mg');
  await pick(page, 'radio', 'Capsule');
  await pick(page, 'radio', 'Red, cross-hatch');
  await page.getByRole('button', { name: 'Next: when' }).click();
  await page
    .getByRole('radiogroup', { name: 'Times a day' })
    .getByRole('radio', { name: '3' })
    .dispatchEvent('click');
  await page.getByRole('button', { name: 'Next: how long' }).click();
  await pick(page, 'radio', '7');
  await page.getByRole('button', { name: 'Next: rules' }).click();
  await pick(page, 'checkbox', 'With food');
  await page.getByRole('button', { name: 'Done: see the schedule' }).click();
  await expect(page.getByRole('heading', { name: 'Today, for Person A' })).toBeVisible();
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('phone flow', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a whole schedule by keyboard alone', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'New schedule' }).focus();
    await page.keyboard.press('Enter');

    await page.getByLabel('Medicine name').focus();
    await page.keyboard.type('Amoxicillin 500 mg');
    await page.getByRole('radio', { name: 'Tablet' }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Capsule' })).toBeChecked();
    await page.getByRole('button', { name: 'Next: when' }).focus();
    await page.keyboard.press('Enter');

    // The sun: arrow keys move it, Enter adds a dose where it stands.
    const sun = page.getByRole('button', { name: /^The sun/ });
    await sun.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Sunrise, midday and sunset')).toBeVisible();
    await page.getByRole('button', { name: 'Next: how long' }).focus();
    await page.keyboard.press('Enter');

    await page.getByRole('radio', { name: '5', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('7 days · 21 capsules in all')).toBeVisible();
    await page.getByRole('button', { name: 'Next: rules' }).focus();
    await page.keyboard.press('Enter');

    await page.getByRole('checkbox', { name: 'With food' }).focus();
    await page.keyboard.press('Space');
    await page.getByRole('button', { name: 'Done: see the schedule' }).focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'Today, for Person A' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Amoxicillin 500 mg 3 a day · 7 days · with food' }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the schedule is kept on the device across a reload', async ({ page }) => {
    await enterAmoxicillin(page);
    await page.reload();
    await expect(
      page.getByRole('link', { name: 'Amoxicillin 500 mg 3 a day · 7 days · with food' }),
    ).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Person A 1 medicine' })).toBeVisible();
  });

  test('a half-entered medicine survives a reload on its step', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New schedule' }).click();
    await page.getByLabel('Medicine name').fill('Paracetamol');
    await page.getByRole('button', { name: 'Next: when' }).click();
    await page.getByRole('button', { name: /^Night, about 10 pm/ }).click();
    await expect(page.getByText('1 tablet each time · about 10 pm')).toBeVisible();
    await page.waitForTimeout(300); // let the write reach IndexedDB
    await page.reload();
    await expect(page).toHaveURL(/\/entry\/when$/);
    await expect(page.getByRole('button', { name: /^Night, about 10 pm/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByText('Paracetamol')).toBeVisible();
  });

  test('Next before an answer says what is missing and stays put', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New schedule' }).click();
    await page.getByRole('button', { name: 'Next: when' }).click();
    await page.getByRole('button', { name: 'Next: how long' }).click();
    await expect(page.getByText('Add at least one time first')).toBeVisible();
    await expect(page).toHaveURL(/\/entry\/when$/);
  });

  test('an entry step with nothing in progress goes back to the start', async ({ page }) => {
    await page.goto('/entry/rules');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Any prescription, in pictures.' }),
    ).toBeVisible();
  });

  test('every screen has no accessibility violations and no console errors', async ({ page }) => {
    const errors = collectErrors(page);
    // Colour transitions would otherwise be caught half way.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const check = async (label: string) => {
      await expect(page.locator('h1')).toBeAttached();
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations, label).toEqual([]);
    };
    await page.goto('/');
    await check('start');
    await page.getByRole('button', { name: 'New schedule' }).click();
    await check('medicine');
    await page.getByRole('button', { name: 'Next: when' }).click();
    await check('when');
    await pick(page, 'radio', 'When needed');
    await check('when needed');
    await pick(page, 'radio', 'Times a day');
    await page
      .getByRole('radiogroup', { name: 'Times a day' })
      .getByRole('radio', { name: '2' })
      .dispatchEvent('click');
    await page.getByRole('button', { name: 'Next: how long' }).click();
    await page.getByRole('button', { name: 'Next: rules' }).click();
    await check('how long, missing');
    await pick(page, 'radio', '7');
    await page.getByRole('button', { name: 'Next: rules' }).click();
    await check('rules');
    await page.getByRole('button', { name: 'Done: see the schedule' }).click();
    await expect(page.getByRole('heading', { name: 'Today, for Person A' })).toBeVisible();
    await check('household');
    expect(errors).toEqual([]);
  });

  test('reduced motion: nothing is left moving', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enterAmoxicillin(page);
    await page.getByRole('link', { name: /^Amoxicillin/ }).click();
    await page.getByRole('button', { name: 'Next: when' }).click();
    await page.waitForTimeout(100);
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    );
    expect(running).toBe(0);
  });
});

test.describe('phone flow widths', () => {
  for (const width of [320, 360, 390, 768, 1024]) {
    test(`no sideways scroll at ${String(width)}px on any screen`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const noScroll = async (label: string) => {
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, label).toBeLessThanOrEqual(0);
      };
      await page.goto('/');
      await noScroll('start');
      await page.getByRole('button', { name: 'New schedule' }).click();
      await pick(page, 'radio', 'Capsule');
      await noScroll('medicine');
      await page.getByRole('button', { name: 'Next: when' }).click();
      await page
        .getByRole('radiogroup', { name: 'Times a day' })
        .getByRole('radio', { name: '4' })
        .dispatchEvent('click');
      await noScroll('when');
      await pick(page, 'radio', 'Every … h');
      await noScroll('every');
      await pick(page, 'radio', 'When needed');
      await noScroll('when needed');
      await page.getByRole('button', { name: 'Next: how long' }).click();
      await pick(page, 'radio', '14');
      await noScroll('how long');
      await page.getByRole('button', { name: 'Next: rules' }).click();
      await noScroll('rules');
      await page.getByRole('button', { name: 'Done: see the schedule' }).click();
      await expect(page.getByRole('heading', { name: 'Today, for Person A' })).toBeVisible();
      await noScroll('household');
    });
  }
});
