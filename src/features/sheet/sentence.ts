import { copy } from '@/copy/en';
import { scheduledDoses, type Medicine } from '@/domain';

/**
 * The sentence after "Tick one box each time.": what the boxes count down to. Whole
 * tablets or capsules are named ("The capsules are finished…"); anything else is
 * "this medicine"; several scheduled medicines each finish with their own boxes.
 */
export function finishedSentence(medicines: readonly Medicine[]): string {
  const t = copy.sheet.finished;
  const scheduled = medicines.filter((m) => scheduledDoses(m.timing).length > 0);
  if (scheduled.length > 1) return t.many;
  const [only] = scheduled;
  if (!only) return t.one;
  if (only.course.ongoing) return t.ongoing;
  const countable =
    (only.form === 'capsule' || only.form === 'tablet' || only.form === 'oval') &&
    Number.isInteger(only.qty);
  if (!countable) return t.one;
  const units = only.form === 'capsule' ? copy.domain.units.capsule : copy.domain.units.tablet;
  return t.units(units.other);
}
