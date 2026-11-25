import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

/** The showcase section of the styleguide, where every primitive is live. */
const showcase = (page: Page) => page.locator('section[aria-labelledby="sg-components"]');

/** Waits out a control's transition, then reads one computed style. */
async function styleOf(locator: Locator, property: string) {
  await locator.page().waitForTimeout(250);
  return locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);
}

test.describe('components: interaction states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/styleguide');
    await expect(showcase(page)).toBeVisible();
  });

  test('a primary button lifts on hover and sinks when pressed', async ({ page }) => {
    const button = showcase(page).getByRole('button', { name: 'Next: when' }).first();
    await button.scrollIntoViewIfNeeded();
    expect(await styleOf(button, 'transform')).toBe('none');

    await button.hover();
    expect(await styleOf(button, 'transform')).toBe('matrix(1, 0, 0, 1, -1, -1)');

    await page.mouse.down();
    expect(await styleOf(button, 'transform')).toBe('matrix(1, 0, 0, 1, 1, 1)');
    await page.mouse.up();
  });

  test('a secondary button takes the sunrise wash on hover', async ({ page }) => {
    const button = showcase(page).getByRole('button', { name: 'Scan a sheet' }).first();
    await button.scrollIntoViewIfNeeded();
    const before = await styleOf(button, 'background-color');
    await button.hover();
    const after = await styleOf(button, 'background-color');
    expect(after).not.toBe(before);
    expect(after).toBe('rgb(253, 243, 214)');
  });

  test('keyboard focus is visible on buttons, choice faces and segmented tracks', async ({
    page,
  }) => {
    // A button: the global pen outline.
    const back = showcase(page).getByRole('button', { name: 'Back' }).first();
    await back.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    expect(await styleOf(back, 'outline-style')).toBe('solid');
    expect(await styleOf(back, 'outline-width')).toBe('3px');

    // A choice card: the outline is drawn on the visible face next to the hidden input.
    const form = showcase(page).getByRole('radiogroup', { name: 'Form' }).first();
    await form.getByRole('radio', { name: 'Capsule' }).focus();
    await page.keyboard.press('ArrowRight');
    const face = form.locator('input:focus-visible + span');
    await expect(face).toHaveCount(1);
    expect(await styleOf(face, 'outline-style')).toBe('solid');

    // A segmented control: the outline goes around the whole track.
    const modes = showcase(page)
      .getByRole('radiogroup', { name: 'How the prescription gives the time' })
      .first();
    await modes.getByRole('radio', { name: 'Times a day' }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    expect(await styleOf(modes, 'outline-style')).toBe('solid');
  });

  test('arrow keys move a chip group’s choice; Space toggles a rule card', async ({ page }) => {
    const times = showcase(page).getByRole('radiogroup', { name: 'Times a day' }).first();
    await times.getByRole('radio', { name: '3' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(times.getByRole('radio', { name: '4' })).toBeChecked();

    const rules = showcase(page).getByRole('group', { name: 'Rules' }).first();
    const water = rules.getByRole('checkbox', { name: 'With water' });
    await water.focus();
    await page.keyboard.press('Space');
    await expect(water).toBeChecked();
    // Choosing "Empty stomach" lifts "With food": the two can't both be true.
    await rules.getByRole('checkbox', { name: 'Empty stomach' }).focus();
    await page.keyboard.press('Space');
    await expect(rules.getByRole('checkbox', { name: 'With food' })).not.toBeChecked();
  });

  test('a stepper disables its ends', async ({ page }) => {
    const stepper = showcase(page).getByRole('group', { name: 'Each time' }).first();
    await expect(stepper.getByRole('button', { name: 'Less' })).toBeDisabled();
    for (let i = 0; i < 3; i += 1) await stepper.getByRole('button', { name: 'More' }).click();
    await expect(stepper.getByRole('button', { name: 'More' })).toBeDisabled();
    await expect(stepper.getByRole('status')).toHaveText(/4\s*capsules/);
  });

  test('has no accessibility violations on desktop', async ({ page }) => {
    const axe = await new AxeBuilder({ page })
      .include('section[aria-labelledby="sg-components"]')
      .analyze();
    expect(axe.violations).toEqual([]);
  });
});
