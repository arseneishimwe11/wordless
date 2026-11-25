import { expect, type Page } from '@playwright/test';

/** Picks a styled radio or checkbox (the native input sits under its drawn face). */
export const pick = (page: Page, role: 'radio' | 'checkbox', name: string) =>
  page.getByRole(role, { name, exact: true }).dispatchEvent('click');

/** Enters the design's main example, Amoxicillin 3 a day for 7 days with food, by clicking. */
export async function enterAmoxicillin(page: Page) {
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

export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** Adds the design's second medicine: paracetamol, only when needed, at most 4 a day. */
export async function addParacetamol(page: Page) {
  await page.getByRole('link', { name: 'Add a medicine' }).click();
  await page.getByLabel('Medicine name').fill('Paracetamol');
  await page.getByRole('checkbox', { name: 'Score line' }).dispatchEvent('click');
  await page.getByRole('button', { name: 'Next: when' }).click();
  await pick(page, 'radio', 'When needed');
  await page.getByRole('button', { name: 'Next: how long' }).click();
  await pick(page, 'radio', 'No end date');
  await page.getByRole('button', { name: 'Next: rules' }).click();
  await page.getByRole('button', { name: 'Done: see the schedule' }).click();
  await expect(page.getByRole('link', { name: /^Paracetamol/ })).toBeVisible();
}
