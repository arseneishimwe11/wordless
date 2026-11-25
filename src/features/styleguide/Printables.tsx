import { copy } from '@/copy/en';

import { DailyStrips } from '../sheet/DailyStrips';
import { FridgeSheet } from '../sheet/FridgeSheet';
import { edgeCasePerson, every8Person, sampleMeta, samplePerson } from './sampleHousehold';
import styles from './Printables.module.css';

const t = copy.styleguide.printables;

/** The printables at full A4 size, for comparison with the design's boards. */
export function Printables() {
  const date = t.date;
  return (
    <section className={styles.printables} aria-labelledby="sg-printables">
      <h2 id="sg-printables" className={styles.title}>
        {t.title}
      </h2>
      <p className={styles.lead}>{t.lead}</p>
      {/* A4 pages scroll sideways on narrow screens; the keyboard can scroll them too. */}
      <div className={styles.row} role="region" aria-label={t.pages} tabIndex={0}>
        <figure className={styles.figure} data-printable="fridge">
          <FridgeSheet person={samplePerson} meta={sampleMeta} date={date} />
          <figcaption>{t.fridge}</figcaption>
        </figure>
        <figure className={styles.figure} data-printable="mono">
          <FridgeSheet person={samplePerson} meta={sampleMeta} date={date} mono />
          <figcaption>{t.mono}</figcaption>
        </figure>
        <figure className={styles.figure} data-printable="strips">
          <DailyStrips person={samplePerson} meta={sampleMeta} date={date} />
          <figcaption>{t.strips}</figcaption>
        </figure>
        <figure className={styles.figure} data-printable="edge">
          <FridgeSheet person={edgeCasePerson} meta={sampleMeta} date={date} />
          <figcaption>{t.edge}</figcaption>
        </figure>
        <figure className={styles.figure} data-printable="every8">
          <FridgeSheet person={every8Person} meta={sampleMeta} date={date} />
          <figcaption>{t.every8}</figcaption>
        </figure>
      </div>
    </section>
  );
}
