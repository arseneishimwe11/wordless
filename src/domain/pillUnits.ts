/**
 * How a dose is drawn: the design counts by drawing each unit again, never by
 * writing a number. Rules from the Pill Builder and the live sheet:
 *
 * - tablets and ovals: one per whole tablet, then a half tablet for a half
 * - capsules: one per capsule
 * - liquid: one spoon per 5 ml, then a half-filled spoon for a remaining 2.5 ml
 * - drops: the dropper, then one drop for each
 * - inhaler: the inhaler, then one puff for each
 */

export const PILL_FORMS = ['tablet', 'oval', 'capsule', 'liquid', 'drops', 'inhaler'] as const;

export type PillForm = (typeof PILL_FORMS)[number];

export type PillUnitKind =
  | 'tablet'
  | 'oval'
  | 'half'
  | 'capsule'
  | 'spoon'
  | 'spoon-half'
  | 'dropper'
  | 'drop'
  | 'inhaler'
  | 'puff';

/** A teaspoon measure, in ml. */
export const SPOON_ML = 5;

const repeat = <T>(item: T, times: number): T[] => Array.from({ length: times }, () => item);

export function pillUnits(form: PillForm, qty: number): PillUnitKind[] {
  switch (form) {
    case 'tablet':
    case 'oval': {
      const whole = Math.floor(qty);
      return [...repeat<PillUnitKind>(form, whole), ...(qty % 1 ? (['half'] as const) : [])];
    }
    case 'capsule':
      return repeat<PillUnitKind>('capsule', qty);
    case 'liquid': {
      const spoons = qty / SPOON_ML;
      return [
        ...repeat<PillUnitKind>('spoon', Math.floor(spoons)),
        ...(spoons % 1 ? (['spoon-half'] as const) : []),
      ];
    }
    case 'drops':
      return ['dropper', ...repeat<PillUnitKind>('drop', qty)];
    case 'inhaler':
      return ['inhaler', ...repeat<PillUnitKind>('puff', qty)];
  }
}

/** Drops and puffs are drawn small, beside the dropper or inhaler. */
export const isSmallUnit = (kind: PillUnitKind) => kind === 'drop' || kind === 'puff';

/** The dropper and inhaler are drawn as the device, at their own size. */
export const isDevice = (kind: PillUnitKind) => kind === 'dropper' || kind === 'inhaler';
