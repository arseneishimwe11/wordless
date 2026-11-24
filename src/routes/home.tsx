import { copy } from '@/copy/en';

/** Placeholder home screen. Replaced by the Start screen in Phase 6. */
export default function Home() {
  return (
    <main>
      <h1>{copy.home.title}</h1>
      <p>{copy.home.lead}</p>
      <p>{copy.home.building}</p>
    </main>
  );
}
