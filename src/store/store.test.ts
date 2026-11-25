// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { amoxicillin, paracetamol } from '@/test/fixtures';

import { createDraftStore } from './draft';
import { createHouseholdStore } from './household';
import { corruptKey, load, save } from './persist';
import { draftSchema, KEYS, migrate, savedHouseholdSchema, STORAGE_VERSION } from './schema';
import { memoryStore, type KeyValueStore } from './storage';

/** Makes a store, loads it, and hands back both. */
async function household(storage: KeyValueStore = memoryStore()) {
  const store = createHouseholdStore(storage);
  await store.getState().load();
  return { store, storage };
}

describe('household store', () => {
  it('starts empty, then saves and reloads exactly', async () => {
    const { store, storage } = await household();
    const s = store.getState();
    expect(s).toMatchObject({ status: 'ready', loadError: null, people: [], preparedBy: '' });

    const grandmother = s.addPerson('Grandmother');
    const child = s.addPerson('Child');
    expect([grandmother?.mark, child?.mark]).toEqual(['a', 'b']);
    if (!grandmother || !child) throw new Error('no person');
    s.saveMedicine(grandmother.id, amoxicillin());
    s.saveMedicine(grandmother.id, paracetamol({ id: 'm2' }));
    s.setPreparedBy('[PHARMACY NAME]');
    await store.getState().flush();

    const reloaded = createHouseholdStore(storage);
    await reloaded.getState().load();
    const { people, preparedBy } = reloaded.getState();
    expect({ people, preparedBy }).toEqual({
      people: store.getState().people,
      preparedBy: '[PHARMACY NAME]',
    });
  });

  it('changes and removes people and medicines', async () => {
    const { store } = await household();
    const s = store.getState();
    const person = s.addPerson('Grandmother');
    if (!person) throw new Error('no person');
    s.renamePerson(person.id, 'Gran');
    s.saveMedicine(person.id, amoxicillin());
    s.saveMedicine(person.id, amoxicillin({ qty: 2 }));
    expect(store.getState().people[0]).toMatchObject({ label: 'Gran' });
    expect(store.getState().people[0]?.medicines.map((m) => m.qty)).toEqual([2]);
    s.removeMedicine(person.id, 'm1');
    expect(store.getState().people[0]?.medicines).toEqual([]);
    s.removePerson(person.id);
    expect(store.getState().people).toEqual([]);
  });

  it('frees a mark when its person is removed, and stops at four people', async () => {
    const { store } = await household();
    const s = store.getState();
    const marks = ['A', 'B', 'C', 'D'].map((label) => s.addPerson(label)?.mark);
    expect(marks).toEqual(['a', 'b', 'c', 'd']);
    expect(s.addPerson('E')).toBeNull();
    const b = store.getState().people[1];
    if (!b) throw new Error('no person');
    s.removePerson(b.id);
    expect(s.addPerson('E')?.mark).toBe('b');
  });

  it('keeps unreadable data aside and starts empty', async () => {
    const storage = memoryStore({ [KEYS.household]: '{"people": [' });
    const store = createHouseholdStore(storage);
    await store.getState().load();
    expect(store.getState()).toMatchObject({ status: 'ready', loadError: 'corrupt', people: [] });
    const kept = [...storage.entries].filter(([key]) =>
      key.startsWith(`${KEYS.household}:corrupt:`),
    );
    expect(kept.map(([, value]) => value)).toEqual(['{"people": [']);
    expect(storage.entries.has(KEYS.household)).toBe(false);
  });

  it('keeps data that fails the schema aside too', async () => {
    const bad = {
      version: 1,
      data: { people: [{ id: 'p', label: 'x', mark: 'z', medicines: [] }], preparedBy: '' },
    };
    const storage = memoryStore({ [KEYS.household]: bad });
    const { store } = await household(storage);
    expect(store.getState().loadError).toBe('corrupt');
    expect([...storage.entries.values()]).toEqual([bad]);
  });

  it('keeps data from a newer version aside, and says so', async () => {
    const newer = { version: STORAGE_VERSION + 1, data: { people: [], preparedBy: '' } };
    const storage = memoryStore({ [KEYS.household]: newer });
    const { store } = await household(storage);
    expect(store.getState().loadError).toBe('newer-version');
    expect([...storage.entries.values()]).toEqual([newer]);
  });

  it('does not save before it has loaded', async () => {
    const storage = memoryStore();
    const store = createHouseholdStore(storage);
    store.getState().addPerson('Early');
    await store.getState().flush();
    expect(storage.entries.size).toBe(0);
  });

  it('carries on in memory when the device storage fails', async () => {
    const broken: KeyValueStore = {
      get: () => Promise.reject(new Error('blocked')),
      set: () => Promise.reject(new Error('full')),
      del: () => Promise.reject(new Error('blocked')),
    };
    const { store } = await household(broken);
    expect(store.getState().loadError).toBe('unavailable');
    store.getState().addPerson('Grandmother');
    await store.getState().flush();
    expect(store.getState()).toMatchObject({
      saveFailed: true,
      people: [{ label: 'Grandmother' }],
    });
  });
});

describe('draft store', () => {
  it('survives a reload half way through an entry', async () => {
    const storage = memoryStore();
    const draft = createDraftStore(storage);
    await draft.getState().load();
    const d = draft.getState();
    d.start('person-1');
    d.setName('Amoxicillin 500 mg');
    d.setForm('capsule');
    d.setColor('red');
    d.setColor('yellow', 'body');
    d.placeTimesADay(3);
    d.setStep('when');
    await draft.getState().flush();

    const reloaded = createDraftStore(storage);
    await reloaded.getState().load();
    const r = reloaded.getState();
    expect(r).toMatchObject({ personId: 'person-1', editingId: null, step: 'when' });
    expect(r.medicine).toEqual(draft.getState().medicine);
    expect(r.medicine).toMatchObject({
      name: 'Amoxicillin 500 mg',
      form: 'capsule',
      color: 'red',
      color2: 'yellow',
      timing: { doses: ['sunrise', 'midday', 'sunset'] },
    });
  });

  it('runs each action through the domain rules', async () => {
    const draft = createDraftStore(memoryStore());
    await draft.getState().load();
    const d = draft.getState();
    const m = () => draft.getState().medicine;

    d.setForm('tablet');
    d.setScore(true);
    d.stepQty(1);
    expect(m()).toMatchObject({ qty: 1.5, score: true });

    d.toggleDose('night');
    d.addDose('sunrise');
    expect(m().timing.doses).toEqual(['sunrise', 'night']);
    d.setEvery(8);
    expect(m().timing).toMatchObject({ mode: 'every', doses: ['sunrise', 'afternoon', 'night'] });
    d.setMode('whenNeeded');
    d.stepMaxPerDay(1);
    expect(m().timing).toMatchObject({ mode: 'whenNeeded', maxPerDay: 5 });
    d.clearDoses();
    expect(m().timing.doses).toEqual([]);

    d.setAmount(10);
    d.stepAmount(1);
    d.setUnit('weeks');
    expect(m().course).toEqual({ ongoing: false, amount: 11, unit: 'weeks' });
    d.pickUsualLength(5);
    d.setOngoing(true);
    expect(m().course).toEqual({ ongoing: true, amount: 5, unit: 'days' });

    d.toggleRule('withFood');
    d.toggleRule('emptyStomach');
    expect(m().rules).toEqual(['emptyStomach']);
    d.clearRules();
    expect(m().rules).toEqual([]);

    d.reset();
    expect(draft.getState()).toMatchObject({ personId: null, editingId: null, step: 'medicine' });
    expect(m().name).toBe('');
  });

  it('edits a copy of a saved medicine', async () => {
    const draft = createDraftStore(memoryStore());
    await draft.getState().load();
    const saved = amoxicillin();
    draft.getState().start('p', saved);
    draft.getState().stepQty(1);
    expect(draft.getState()).toMatchObject({ editingId: 'm1', medicine: { qty: 2 } });
    expect(saved.qty).toBe(1);
  });

  it('starts blank when the saved draft is unreadable', async () => {
    const storage = memoryStore({ [KEYS.draft]: { version: 1, data: { step: 'nowhere' } } });
    const draft = createDraftStore(storage);
    await draft.getState().load();
    expect(draft.getState()).toMatchObject({ loadError: 'corrupt', personId: null });
  });

  it('notes a failed save', async () => {
    const storage = memoryStore();
    const draft = createDraftStore({ ...storage, set: () => Promise.reject(new Error('full')) });
    await draft.getState().load();
    draft.getState().setName('x');
    await draft.getState().flush();
    expect(draft.getState().saveFailed).toBe(true);
  });
});

describe('migration', () => {
  /** A made-up earlier format, to prove the upgrade path: people were called "members". */
  const v0 = { version: 0, data: { members: [], pharmacy: 'Old Pharmacy' } };
  const fromV0 = (data: unknown) => {
    const old = data as { members: unknown[]; pharmacy: string };
    return { people: old.members, preparedBy: old.pharmacy };
  };

  it('upgrades step by step to the current version', async () => {
    expect(migrate(v0, { 0: fromV0 })).toEqual({
      ok: true,
      data: { people: [], preparedBy: 'Old Pharmacy' },
    });
    const storage = memoryStore({ key: v0 });
    expect(await load(storage, 'key', savedHouseholdSchema, { migrations: { 0: fromV0 } })).toEqual(
      { data: { people: [], preparedBy: 'Old Pharmacy' }, error: null },
    );
  });

  it('treats a version it has no upgrade for as unreadable', async () => {
    expect(migrate(v0, {})).toEqual({ ok: false, reason: 'gap' });
    const storage = memoryStore({ key: v0 });
    expect(await load(storage, 'key', savedHouseholdSchema, { now: () => 5 })).toEqual({
      data: null,
      error: 'corrupt',
    });
    expect(storage.entries.get(corruptKey('key', 5))).toEqual(v0);
  });

  it('saves in the current envelope', async () => {
    const storage = memoryStore();
    await save(storage, 'key', { a: 1 });
    expect(storage.entries.get('key')).toEqual({ version: STORAGE_VERSION, data: { a: 1 } });
    expect(await load(storage, 'missing', draftSchema)).toEqual({ data: null, error: null });
  });

  it('reports storage that fails while keeping bad data aside', async () => {
    const storage = memoryStore({ key: 'junk' });
    const failing = { ...storage, set: () => Promise.reject(new Error('full')) };
    expect(await load(failing, 'key', draftSchema)).toEqual({ data: null, error: 'unavailable' });
    expect(storage.entries.get('key')).toBe('junk');
  });
});
