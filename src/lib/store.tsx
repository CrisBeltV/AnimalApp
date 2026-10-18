import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { KIND_INFO, newlyUnlocked, walkXp } from './game';
import type { Achievement } from './game';
import { emptyData } from './types';
import { cancel } from './notify';
import type { AppData, Entry, EntryKind, Pet, Reminder, Report, Vet } from './types';

// Por ahora los datos viven en el teléfono. Cuando conectemos Supabase
// se guardarán también en la nube con la cuenta del dueño.
const KEY = 'animaapp:v1';

type NewEntry = Omit<Entry, 'id' | 'xp' | 'at'> & { at?: number };
type EntryPatch = Partial<Omit<Entry, 'id' | 'kind' | 'xp'>>;

type Store = {
  ready: boolean;
  data: AppData;
  celebrate: Achievement[];
  dismissCelebrate: () => void;
  createPet: (ownerName: string, pet: Omit<Pet, 'createdAt'>) => void;
  setOwnerName: (name: string) => void;
  addReport: (report: Omit<Report, 'id'>) => void;
  addEntry: (entry: NewEntry) => string;
  updateEntry: (id: string, patch: EntryPatch) => void;
  removeEntry: (id: string) => void;
  addReminders: (reminders: Omit<Reminder, 'id'>[]) => void;
  removeReminder: (id: string) => void;
  saveVet: (vet: Omit<Vet, 'id'> & { id?: string }) => string;
  startWalk: () => void;
  finishWalk: () => number;
  cancelWalk: () => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

function withAchievements(data: AppData, onUnlock: (a: Achievement[]) => void): AppData {
  const fresh = newlyUnlocked(data, Date.now());
  if (fresh.length === 0) return data;
  onUnlock(fresh);
  return { ...data, unlocked: [...data.unlocked, ...fresh.map((a) => a.id)] };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const [celebrate, setCelebrate] = useState<Achievement[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setData({ ...emptyData, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((d) => withAchievements(fn(d), (a) => setCelebrate((c) => [...c, ...a])));
  }, []);

  const addEntry = useCallback(
    (e: NewEntry) => {
      const xp = e.kind === 'paseo' ? walkXp(e.minutes ?? 0) : KIND_INFO[e.kind].xp;
      const entry: Entry = {
        ...e,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: e.at ?? Date.now(),
        xp,
      };
      update((d) => ({ ...d, entries: [entry, ...d.entries].sort((a, b) => b.at - a.at) }));
      return entry.id;
    },
    [update],
  );

  const store = useMemo<Store>(
    () => ({
      ready,
      data,
      celebrate,
      dismissCelebrate: () => setCelebrate([]),
      createPet: (ownerName, pet) =>
        update((d) => ({ ...d, ownerName, pet: { ...pet, createdAt: Date.now() } })),
      setOwnerName: (ownerName) => setData((d) => ({ ...d, ownerName })),
      addReport: (r) =>
        setData((d) => ({ ...d, reports: [{ ...r, id: `r-${Date.now()}` }, ...d.reports] })),
      addEntry,
      updateEntry: (id, patch) =>
        setData((d) => ({
          ...d,
          entries: d.entries
            .map((e) => {
              if (e.id !== id) return e;
              const next = { ...e, ...patch };
              return e.kind === 'paseo' ? { ...next, xp: walkXp(next.minutes ?? 0) } : next;
            })
            .sort((a, b) => b.at - a.at),
        })),
      removeEntry: (id) =>
        setData((d) => {
          d.reminders.filter((r) => r.entryId === id).forEach((r) => cancel(r.notificationId));
          return {
            ...d,
            entries: d.entries.filter((e) => e.id !== id),
            reminders: d.reminders.filter((r) => r.entryId !== id),
          };
        }),
      addReminders: (list) =>
        setData((d) => ({
          ...d,
          reminders: [
            ...d.reminders,
            ...list.map((r, i) => ({ ...r, id: `rec-${Date.now()}-${i}` })),
          ].sort((a, b) => a.at - b.at),
        })),
      removeReminder: (id) =>
        setData((d) => {
          cancel(d.reminders.find((r) => r.id === id)?.notificationId);
          return { ...d, reminders: d.reminders.filter((r) => r.id !== id) };
        }),
      saveVet: (vet) => {
        const id = vet.id ?? `vet-${Date.now()}`;
        setData((d) => ({ ...d, vets: [{ ...vet, id }, ...d.vets.filter((v) => v.id !== id)] }));
        return id;
      },
      startWalk: () => setData((d) => ({ ...d, activeWalkStart: Date.now() })),
      finishWalk: () => {
        const start = data.activeWalkStart;
        if (!start) return 0;
        const minutes = Math.max(1, Math.round((Date.now() - start) / 60000));
        setData((d) => ({ ...d, activeWalkStart: null }));
        addEntry({ kind: 'paseo', minutes, at: start });
        return minutes;
      },
      cancelWalk: () => setData((d) => ({ ...d, activeWalkStart: null })),
      reset: () => setData(emptyData),
    }),
    [ready, data, celebrate, update, addEntry],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error('useStore debe usarse dentro de StoreProvider');
  return store;
}
