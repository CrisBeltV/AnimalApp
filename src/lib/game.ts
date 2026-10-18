import type { AppData, Entry, EntryKind, Species } from './types';

export const MAX_LEVEL = 15;
const DAY = 24 * 60 * 60 * 1000;


export const KIND_INFO: Record<EntryKind, { label: string; icon: string; xp: number }> = {
  comida: { label: 'Comida', icon: '🍽️', xp: 10 },
  agua: { label: 'Agua', icon: '💧', xp: 2 },
  paseo: { label: 'Paseo', icon: '🦮', xp: 0 }, // depende de los minutos
  peso: { label: 'Peso', icon: '⚖️', xp: 10 },
  deposicion: { label: 'Deposición', icon: '💩', xp: 5 },
  medicamento: { label: 'Medicamento', icon: '💊', xp: 10 },
  vacuna: { label: 'Vacuna', icon: '💉', xp: 30 },
  veterinario: { label: 'Cita al veterinario', icon: '🩺', xp: 30 },
  enfermedad: { label: 'Síntoma', icon: '🤒', xp: 5 },
  lesion: { label: 'Lesión', icon: '🩹', xp: 5 },
  novedad: { label: 'Novedad', icon: '⚠️', xp: 5 },
  nota: { label: 'Diario', icon: '📝', xp: 5 },
};

export const DAY_MS = DAY;

// Misión del día: pasear (o jugar, si es gato) unos minutos. Da XP extra una vez al día.
export const MISSION_XP = 40;
export function missionGoal(species: Species) {
  return species === 'gato' ? 15 : 20;
}

export function minutesOn(entries: Entry[], dayStart: number) {
  return entries
    .filter((e) => e.kind === 'paseo' && e.at >= dayStart && e.at < dayStart + DAY)
    .reduce((s, e) => s + (e.minutes ?? 0), 0);
}

function missionDays(data: AppData) {
  if (!data.pet) return 0;
  const goal = missionGoal(data.pet.species);
  const days = new Set(data.entries.filter((e) => e.kind === 'paseo').map((e) => startOfDay(e.at)));
  let count = 0;
  for (const d of days) if (minutesOn(data.entries, d) >= goal) count++;
  return count;
}

// Minutos de los últimos 7 días (de lunes a domingo de esta semana).
export function weekMinutes(entries: Entry[], now: number) {
  const today = new Date(startOfDay(now));
  const monday = startOfDay(now) - ((today.getDay() + 6) % 7) * DAY;
  return Array.from({ length: 7 }, (_, i) => minutesOn(entries, monday + i * DAY));
}

export function lastWeight(entries: Entry[]) {
  return entries.find((e) => e.kind === 'peso')?.kg;
}

export function waterGoal(data: AppData) {
  const kg = lastWeight(data.entries);
  if (kg) return Math.max(150, Math.round((kg * 60) / 50) * 50);
  return data.pet?.species === 'gato' ? 250 : 800;
}

export function todayEntries(entries: Entry[], now: number, kind?: EntryKind) {
  const start = startOfDay(now);
  return entries.filter((e) => e.at >= start && (!kind || e.kind === kind));
}

export const WALK_GOALS = [15, 30, 45];

export function activityWord(species: Species) {
  return species === 'gato' ? 'Juego' : 'Paseo';
}

export function walkXp(minutes: number) {
  let xp = Math.max(5, Math.round(minutes));
  for (const goal of WALK_GOALS) if (minutes >= goal) xp += 10;
  return xp;
}

// XP total necesario para llegar a cada nivel: 0, 100, 300, 600, ... (nivel 15 = 10.500)
export function xpForLevel(level: number) {
  return 50 * (level - 1) * level;
}

export function levelInfo(totalXp: number) {
  let level = 1;
  while (level < MAX_LEVEL && totalXp >= xpForLevel(level + 1)) level++;
  const base = xpForLevel(level);
  const next = level < MAX_LEVEL ? xpForLevel(level + 1) : base;
  const progress = level < MAX_LEVEL ? (totalXp - base) / (next - base) : 1;
  return { level, totalXp, base, next, progress };
}

export function totalXp(data: AppData) {
  const fromEntries = data.entries.reduce((sum, e) => sum + e.xp, 0);
  const fromAchievements = ACHIEVEMENTS.filter((a) => data.unlocked.includes(a.id)).reduce(
    (sum, a) => sum + a.xp,
    0,
  );
  return fromEntries + fromAchievements + missionDays(data) * MISSION_XP;
}

export function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysWith(entries: Entry[], kind?: EntryKind) {
  const days = new Set<number>();
  for (const e of entries) if (!kind || e.kind === kind) days.add(startOfDay(e.at));
  return days;
}

// Días seguidos (terminando hoy o ayer) con al menos un registro del tipo dado.
export function streak(entries: Entry[], now: number, kind?: EntryKind) {
  const days = daysWith(entries, kind);
  let day = startOfDay(now);
  if (!days.has(day)) day -= DAY;
  let count = 0;
  while (days.has(day)) {
    count++;
    day -= DAY;
  }
  return count;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export type Stats = {
  salud: number;
  actividad: number;
  alimentacion: number;
  felicidad: number;
  amor: number;
};

export function computeStats(data: AppData, now: number): Stats {
  const { entries } = data;
  const week = entries.filter((e) => e.at >= startOfDay(now) - 6 * DAY);
  // Una mascota recién creada no se castiga por los días antes de existir en la app.
  const born = startOfDay(data.pet?.createdAt ?? now);
  const weekDays = Math.max(1, Math.min(7, Math.round((startOfDay(now) - born) / DAY) + 1));
  const year = entries.filter((e) => e.at >= now - 365 * DAY);

  // Salud: datos reales del expediente, no un diagnóstico.
  let salud = 60;
  if (year.some((e) => e.kind === 'vacuna')) salud += 20;
  if (year.some((e) => e.kind === 'veterinario')) salud += 20;
  const recentIssues = entries.filter(
    (e) => isIssue(e) && e.at >= now - 7 * DAY,
  ).length;
  salud -= recentIssues * 15;

  const dailyGoal = data.pet?.species === 'gato' ? 15 : 30;
  const weekMinutes = week.filter((e) => e.kind === 'paseo').reduce((s, e) => s + (e.minutes ?? 0), 0);
  const actividad = (weekMinutes / (dailyGoal * weekDays)) * 100;

  const alimentacion = (daysWith(week, 'comida').size / weekDays) * 100;

  // Ánimo: sube con los registros constantes y baja si pasan días sin cuidarlo.
  const last = entries.reduce((max, e) => Math.max(max, e.at), data.pet?.createdAt ?? now);
  const daysAway = Math.floor((startOfDay(now) - startOfDay(last)) / DAY);
  const days = streak(entries, now);
  const felicidad = 70 + days * 5 - daysAway * 20;
  const amor = 50 + days * 7 - daysAway * 15;

  return {
    salud: clamp(salud),
    actividad: clamp(actividad),
    alimentacion: clamp(alimentacion),
    felicidad: clamp(felicidad),
    amor: clamp(amor),
  };
}

export type Mood = 'feliz' | 'normal' | 'triste';

export function mood(stats: Stats): Mood {
  const avg = (stats.felicidad + stats.amor + stats.alimentacion) / 3;
  if (avg >= 65) return 'feliz';
  if (avg >= 35) return 'normal';
  return 'triste';
}

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  check: (data: AppData, now: number) => boolean;
};

const walks = (d: AppData) => d.entries.filter((e) => e.kind === 'paseo');

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primer-paseo',
    title: 'Primer paseo',
    description: 'Registra tu primer paseo',
    icon: '👣',
    xp: 20,
    check: (d) => walks(d).length >= 1,
  },
  ...WALK_GOALS.map((min) => ({
    id: `paseo-${min}`,
    title: `Paseo de ${min} min`,
    description: `Completa un paseo de ${min} minutos o más`,
    icon: min === 15 ? '🥉' : min === 30 ? '🥈' : '🥇',
    xp: min,
    check: (d: AppData) => walks(d).some((e) => (e.minutes ?? 0) >= min),
  })),
  {
    id: 'paseo-7-dias',
    title: '7 días paseando',
    description: 'Pasea 7 días seguidos',
    icon: '📅',
    xp: 50,
    check: (d, now) => streak(d.entries, now, 'paseo') >= 7,
  },
  {
    id: 'racha-comida-7',
    title: 'Racha de comida',
    description: 'Registra la comida 7 días seguidos',
    icon: '🔥',
    xp: 50,
    check: (d, now) => streak(d.entries, now, 'comida') >= 7,
  },
  {
    id: 'vet-confianza',
    title: 'Veterinario de confianza',
    description: 'Registra una visita al veterinario',
    icon: '🏥',
    xp: 30,
    check: (d) => d.entries.some((e) => e.kind === 'veterinario'),
  },
  {
    id: 'vacunas',
    title: 'Vacunas al día',
    description: 'Registra una vacuna',
    icon: '🛡️',
    xp: 30,
    check: (d) => d.entries.some((e) => e.kind === 'vacuna'),
  },
  {
    id: 'diez-paseos',
    title: 'Caminante',
    description: 'Completa 10 paseos',
    icon: '🏞️',
    xp: 60,
    check: (d) => walks(d).length >= 10,
  },
];

export function newlyUnlocked(data: AppData, now: number) {
  return ACHIEVEMENTS.filter((a) => !data.unlocked.includes(a.id) && a.check(data, now));
}

// Una novedad cuenta como señal de alerta si marca algo distinto de "deposiciones normales".
export function isIssue(e: Entry) {
  if (e.kind === 'enfermedad' || e.kind === 'lesion') return true;
  return e.kind === 'novedad' && (e.signs ?? []).some((s) => s !== 'normales');
}
