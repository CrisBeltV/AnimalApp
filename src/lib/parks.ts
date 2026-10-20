import { parkStats } from './game';
import type { AppData, Park } from './types';

// Conquista de parques: un parque es "tuyo" cuando pasean en él la meta de minutos del mes.
export const CONQUER_MIN = 60;
export const ZONE_RADIUS = 1000; // "Tu zona": 1 km a la redonda

export type ParkStatus = 'mio' | 'progreso' | 'libre';

export const STATUS: Record<ParkStatus, { label: string; fill: string; stroke: string; text: string; dashed: boolean }> = {
  mio: { label: 'Tuyo', fill: 'rgba(42,100,168,0.28)', stroke: '#2A64A8', text: '#2A64A8', dashed: false },
  progreso: { label: 'En conquista', fill: 'rgba(42,100,168,0.12)', stroke: '#2A64A8', text: '#2A64A8', dashed: true },
  libre: { label: 'Libre', fill: 'rgba(255,255,255,0.55)', stroke: '#FFFFFF', text: '#5B6676', dashed: true },
};

// Hasta tener GPS, cada parque tiene un lugar fijo cerca de ti (entre 250 m y 950 m).
// El número se mezcla bien para que dos parques creados seguidos no queden encima.
export function parkSpot(id: string) {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = (h ^ (h >>> 16)) >>> 0;
  const angle = ((h % 3600) / 10) * (Math.PI / 180);
  const dist = 250 + ((h >>> 12) % 701);
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

function monthStart(now: number) {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function parkInfo(data: AppData, park: Park, now: number) {
  const st = parkStats(data.entries, park.id);
  const from = monthStart(now);
  const month = Math.round(st.visits.filter((e) => e.at >= from).reduce((s, e) => s + (e.minutes ?? 0), 0));
  const status: ParkStatus = month >= CONQUER_MIN ? 'mio' : month > 0 ? 'progreso' : 'libre';
  const spot = parkSpot(park.id);
  return {
    park,
    ...st,
    month,
    status,
    pct: Math.min(100, Math.round((month / CONQUER_MIN) * 100)),
    spot,
    distance: Math.hypot(spot.x, spot.y),
  };
}

export type ParkInfo = ReturnType<typeof parkInfo>;

export function allParks(data: AppData, now: number) {
  return data.parks.map((p) => parkInfo(data, p, now)).sort((a, b) => a.distance - b.distance);
}

export function conquestHint(p: ParkInfo) {
  if (p.status === 'mio') return `Es tuyo este mes: ${p.month} min paseando aquí.`;
  const left = CONQUER_MIN - p.month;
  return p.month > 0 ? `Te faltan ${left} min este mes para que sea tuyo.` : `Pasea ${CONQUER_MIN} min este mes y será tuyo.`;
}

// De día entre 6 a. m. y 6 p. m.
export function isDay(now: number) {
  const h = new Date(now).getHours();
  return h >= 6 && h < 18;
}
