import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from './auth';
import { fetchReports, publishReport, pullData, pushData } from './cloud';

import { KIND_INFO, NEW_PARK_XP, newlyUnlocked, walkXp } from './game';
import type { Achievement } from './game';
import { emptyData } from './types';
import { cancel } from './notify';
import { sampleReports } from './samples';
import type { AppData, Entry, Park, Pet, Provider, Reminder, Report, Settings, Vet, WalkGoal, WalkRoutine } from './types';

// Los datos viven en el teléfono y, si el dueño entró con su cuenta,
// también en la nube (Supabase), para no perderlos al cambiar de teléfono.
const KEY = 'animaapp:v1';

// sincronizando: trayendo o subiendo datos; sin-conexion: el último intento falló.
export type SyncState = 'local' | 'sincronizando' | 'al-dia' | 'sin-conexion';

type NewEntry = Omit<Entry, 'id' | 'xp' | 'at'> & { at?: number };
type EntryPatch = Partial<Omit<Entry, 'id' | 'kind' | 'xp'>>;

type Store = {
  ready: boolean;
  data: AppData;
  sync: SyncState;
  // Reportes que se muestran: los tuyos, los de la comunidad y, sin nube, los de ejemplo.
  reports: (now: number) => Report[];
  refreshReports: () => void;
  // Al cerrar sesión se borran los datos de este teléfono (siguen en la nube).
  clearLocal: () => void;
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
  savePark: (park: Omit<Park, 'id'> & { id?: string }) => string;
  removePark: (id: string) => void;
  saveRoutine: (routine: Omit<WalkRoutine, 'id'> & { id?: string }) => string;
  removeRoutine: (id: string) => void;
  saveProvider: (provider: Omit<Provider, 'id'> & { id?: string }) => string;
  setSettings: (patch: Partial<Settings>) => void;
  startWalk: (goal?: WalkGoal) => void;
  finishWalk: () => { minutes: number; id: string };
  cancelWalk: () => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

// XP de un registro. Un paseo en un parque donde no habían ido antes suma 30 XP extra.
function entryXp(e: Pick<Entry, 'id' | 'kind' | 'minutes' | 'fields' | 'at'>, others: Entry[]) {
  if (e.kind !== 'paseo') return KIND_INFO[e.kind].xp;
  const park = e.fields?.parqueId;
  const isNew = park && !others.some((o) => o.id !== e.id && o.kind === 'paseo' && o.at < e.at && o.fields?.parqueId === park);
  return walkXp(e.minutes ?? 0) + (isNew ? NEW_PARK_XP : 0);
}

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
  const { userId, enabled } = useAuth();
  const [sync, setSync] = useState<SyncState>('local');
  const [neighbors, setNeighbors] = useState<Report[]>([]);
  // Cuenta cuya copia ya se trajo de la nube; antes de eso no se sube nada.
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  // Si falla la conexión, se vuelve a intentar a los 30 segundos.
  const [retry, setRetry] = useState(0);
  const retryLater = useCallback(() => {
    setSync('sin-conexion');
    setTimeout(() => setRetry((n) => n + 1), 30000);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        setData({ ...emptyData, ...saved, settings: { ...emptyData.settings, ...saved.settings } });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  // Al entrar con una cuenta: se queda la copia más nueva (la del teléfono o la de la nube).
  useEffect(() => {
    if (!ready || !userId) {
      setSyncedFor(null);
      setSync('local');
      return;
    }
    if (syncedFor === userId) return;
    let alive = true;
    setSync('sincronizando');
    pullData(userId)
      .then((cloud) => {
        if (!alive) return;
        const cloudIsNewer = cloud && ((cloud.updatedAt ?? 0) >= data.updatedAt || (!data.pet && cloud.pet));
        if (cloud && cloudIsNewer) {
          setData({ ...emptyData, ...cloud, settings: { ...emptyData.settings, ...cloud.settings } });
        }
        setSyncedFor(userId);
        setSync('al-dia');
      })
      .catch(() => alive && retryLater());
    return () => {
      alive = false;
    };
    // Solo al cambiar de cuenta, al terminar de leer el teléfono o al reintentar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userId, retry]);

  // Cada cambio se sube a la nube dos segundos después del último.
  useEffect(() => {
    if (!userId || syncedFor !== userId) return;
    const t = setTimeout(() => {
      setSync('sincronizando');
      pushData(userId, data)
        .then(() => setSync('al-dia'))
        .catch(retryLater);
    }, 2000);
    return () => clearTimeout(t);
  }, [data, userId, syncedFor, retry, retryLater]);

  const refreshReports = useCallback(() => {
    if (!userId) return setNeighbors([]);
    fetchReports(userId)
      .then(setNeighbors)
      .catch(() => {});
  }, [userId]);

  useEffect(refreshReports, [refreshReports]);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((d) => ({ ...withAchievements(fn(d), (a) => setCelebrate((c) => [...c, ...a])), updatedAt: Date.now() }));
  }, []);

  // Igual que setData, pero marca la hora del cambio.
  const change = useCallback((fn: (d: AppData) => AppData) => {
    setData((d) => ({ ...fn(d), updatedAt: Date.now() }));
  }, []);

  const addEntry = useCallback(
    (e: NewEntry) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      update((d) => {
        const at = e.at ?? Date.now();
        const entry: Entry = { ...e, id, at, xp: entryXp({ ...e, id, at }, d.entries) };
        return { ...d, entries: [entry, ...d.entries].sort((a, b) => b.at - a.at) };
      });
      return id;
    },
    [update],
  );

  const store = useMemo<Store>(
    () => ({
      ready,
      data,
      celebrate,
      sync,
      reports: (now) => {
        const shared = new Set(neighbors.map((r) => r.cloudId));
        const own = data.reports.filter((r) => !r.cloudId || !shared.has(r.cloudId));
        const real = [...own, ...neighbors].sort((a, b) => b.at - a.at);
        return enabled && userId ? real : [...real, ...sampleReports(now)];
      },
      refreshReports,
      clearLocal: () => {
        setSyncedFor(null);
        setData(emptyData);
      },
      dismissCelebrate: () => setCelebrate([]),
      createPet: (ownerName, pet) =>
        update((d) => ({ ...d, ownerName, pet: { ...pet, createdAt: Date.now() } })),
      setOwnerName: (ownerName) => change((d) => ({ ...d, ownerName })),
      addReport: (r) => {
        const id = `r-${Date.now()}`;
        change((d) => ({ ...d, reports: [{ ...r, id, mine: true }, ...d.reports] }));
        if (userId) {
          publishReport(r)
            .then((cloudId) => {
              if (!cloudId) return;
              change((d) => ({ ...d, reports: d.reports.map((x) => (x.id === id ? { ...x, cloudId } : x)) }));
              refreshReports();
            })
            .catch(() => {});
        }
      },
      addEntry,
      updateEntry: (id, patch) =>
        update((d) => ({
          ...d,
          entries: d.entries
            .map((e) => {
              if (e.id !== id) return e;
              const next = { ...e, ...patch };
              return { ...next, xp: entryXp(next, d.entries) };
            })
            .sort((a, b) => b.at - a.at),
        })),
      removeEntry: (id) =>
        change((d) => {
          d.reminders.filter((r) => r.entryId === id).forEach((r) => cancel(r.notificationId));
          return {
            ...d,
            entries: d.entries.filter((e) => e.id !== id),
            reminders: d.reminders.filter((r) => r.entryId !== id),
          };
        }),
      addReminders: (list) =>
        change((d) => ({
          ...d,
          reminders: [
            ...d.reminders,
            ...list.map((r, i) => ({ ...r, id: `rec-${Date.now()}-${i}` })),
          ].sort((a, b) => a.at - b.at),
        })),
      removeReminder: (id) =>
        change((d) => {
          cancel(d.reminders.find((r) => r.id === id)?.notificationId);
          return { ...d, reminders: d.reminders.filter((r) => r.id !== id) };
        }),
      saveVet: (vet) => {
        const id = vet.id ?? `vet-${Date.now()}`;
        change((d) => ({ ...d, vets: [{ ...vet, id }, ...d.vets.filter((v) => v.id !== id)] }));
        return id;
      },
      savePark: (park) => {
        const id = park.id ?? `parque-${Date.now()}`;
        change((d) => ({ ...d, parks: [{ ...park, id }, ...d.parks.filter((p) => p.id !== id)] }));
        return id;
      },
      removePark: (id) => change((d) => ({ ...d, parks: d.parks.filter((p) => p.id !== id) })),
      saveRoutine: (routine) => {
        const id = routine.id ?? `rutina-${Date.now()}`;
        change((d) => ({ ...d, routines: [{ ...routine, id }, ...(d.routines ?? []).filter((r) => r.id !== id)] }));
        return id;
      },
      removeRoutine: (id) => change((d) => ({ ...d, routines: (d.routines ?? []).filter((r) => r.id !== id) })),
      saveProvider: (provider) => {
        const id = provider.id ?? `prov-${Date.now()}`;
        change((d) => ({ ...d, providers: [{ ...provider, id }, ...d.providers.filter((p) => p.id !== id)] }));
        return id;
      },
      setSettings: (patch) => change((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      startWalk: (goal) => change((d) => ({ ...d, activeWalkStart: Date.now(), walkGoal: goal ?? { tipo: 'paseo' } })),
      finishWalk: () => {
        const start = data.activeWalkStart;
        if (!start) return { minutes: 0, id: '' };
        const minutes = Math.max(1, Math.round((Date.now() - start) / 60000));
        const goal = data.walkGoal;
        change((d) => ({ ...d, activeWalkStart: null, walkGoal: undefined }));
        const fields: Record<string, string> = { tipo: goal?.tipo ?? 'paseo' };
        if (goal?.parqueId) fields.parqueId = goal.parqueId;
        const id = addEntry({ kind: 'paseo', minutes, at: start, fields });
        return { minutes, id };
      },
      cancelWalk: () => change((d) => ({ ...d, activeWalkStart: null, walkGoal: undefined })),
      reset: () => setData({ ...emptyData, updatedAt: Date.now() }),
    }),
    [ready, data, celebrate, update, change, addEntry, sync, neighbors, enabled, userId, refreshReports],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error('useStore debe usarse dentro de StoreProvider');
  return store;
}
