import { startOfDay } from './game';
import type { Entry } from './types';

// Tiempos acumulados de actividad (paseo, juego, entrenamiento, guardería) por día y por mes.

const DAY = 24 * 60 * 60 * 1000;

export const PERIODS = [90, 30, 15, 7];

export function activityEntries(entries: Entry[], tipo: string) {
  return entries.filter((e) => e.kind === 'paseo' && (tipo === 'todas' || (e.fields?.tipo ?? 'paseo') === tipo));
}

// Minutos por día (clave: inicio del día).
export function minutesByDay(list: Entry[]) {
  const map = new Map<number, number>();
  for (const e of list) {
    const k = startOfDay(e.at);
    map.set(k, (map.get(k) ?? 0) + (e.minutes ?? 0));
  }
  return map;
}

function sumRange(list: Entry[], from: number, to: number) {
  const inside = list.filter((e) => e.at >= from && e.at < to);
  const days = new Set(inside.map((e) => startOfDay(e.at))).size;
  const minutes = inside.reduce((s, e) => s + (e.minutes ?? 0), 0);
  return { days, minutes, count: inside.length };
}

// El periodo (los últimos N días, hoy incluido) comparado con los N días anteriores.
export function periodStats(list: Entry[], now: number, days: number) {
  const end = startOfDay(now) + DAY;
  const start = end - days * DAY;
  const cur = sumRange(list, start, end);
  const prev = sumRange(list, start - days * DAY, start);
  const byDay = minutesByDay(list);
  const daily = Array.from({ length: days }, (_, i) => byDay.get(start + i * DAY) ?? 0);
  const prevDaily = Array.from({ length: days }, (_, i) => byDay.get(start - days * DAY + i * DAY) ?? 0);
  return { ...cur, prev, daily, prevDaily, start };
}

// Cambio frente al periodo anterior: -67 %, +20 %, o null si antes no había nada.
export function change(cur: number, prev: number) {
  if (prev <= 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Últimos 12 meses: días con actividad y minutos de cada mes.
export function monthly(list: Entry[], now: number, count = 12) {
  const d = new Date(now);
  return Array.from({ length: count }, (_, i) => {
    const from = new Date(d.getFullYear(), d.getMonth() - (count - 1 - i), 1).getTime();
    const to = new Date(d.getFullYear(), d.getMonth() - (count - 2 - i), 1).getTime();
    const m = new Date(from);
    return { label: MONTHS[m.getMonth()], year: m.getFullYear(), ...sumRange(list, from, to) };
  });
}

// "2 h 27 min", "45 min"
export function hm(minutes: number) {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

export function dayLabel(t: number) {
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthName(t: number) {
  return MONTHS[new Date(t).getMonth()];
}
