import { spotFor } from './barrio';
import type { Report } from './types';

// Reglas de los reportes de la comunidad: tipos, colores, distancia y textos.

export type Kind = 'perdida' | 'visto' | 'emergencia' | 'adopcion' | 'hogar';

// 'encontrada' (versiones viejas) se muestra como 'visto'.
export function kindOf(r: Pick<Report, 'kind'>): Kind {
  return r.kind === 'encontrada' ? 'visto' : r.kind;
}

export const KINDS: Record<Kind, { filter: string; bg: string; text: string; pin: string; icon: string }> = {
  perdida: { filter: 'Perdidos', bg: '#FDE3E6', text: '#B0182D', pin: '#E8344B', icon: '🔍' },
  visto: { filter: 'Vistos', bg: '#DDF2E5', text: '#146B39', pin: '#1E8A4C', icon: '👀' },
  emergencia: { filter: 'Emergencias', bg: '#FFE9D2', text: '#9A4A00', pin: '#F08A1C', icon: '🚑' },
  adopcion: { filter: 'Adopción', bg: '#EDE5FB', text: '#4B3A78', pin: '#8C6FD6', icon: '🏡' },
  hogar: { filter: 'Hogar temporal', bg: '#E1EEFB', text: '#0F2540', pin: '#2A64A8', icon: '🛏️' },
};

export const REUNITED = { bg: '#DDF2E5', text: '#146B39', pin: '#1E8A4C' };

export const KIND_ORDER: Kind[] = ['perdida', 'visto', 'emergencia', 'adopcion', 'hogar'];

// Texto de la insignia: PERDIDO / PERDIDA, VISTO, EMERGENCIA, EN ADOPCIÓN, BUSCA HOGAR, REENCONTRADO.
export function badge(r: Report) {
  if (r.closed) return r.female ? 'REENCONTRADA' : 'REENCONTRADO';
  switch (kindOf(r)) {
    case 'perdida':
      return r.female ? 'PERDIDA' : 'PERDIDO';
    case 'visto':
      return r.female ? 'VISTA' : 'VISTO';
    case 'emergencia':
      return 'EMERGENCIA';
    case 'adopcion':
      return 'EN ADOPCIÓN';
    case 'hogar':
      return 'BUSCA HOGAR';
  }
}

export function badgeColors(r: Report) {
  return r.closed ? REUNITED : KINDS[kindOf(r)];
}

// Lugar aproximado en el mapa: el guardado o uno fijo cerca de ti, hasta tener GPS.
export function spot(r: Pick<Report, 'id' | 'x' | 'y'>) {
  if (r.x !== undefined && r.y !== undefined) return { x: r.x, y: r.y };
  return spotFor(r.id, 350);
}

export function meters(r: Pick<Report, 'id' | 'x' | 'y'>) {
  const p = spot(r);
  return Math.hypot(p.x, p.y);
}

// 600 m · 1,4 km
export function distanceText(m: number) {
  if (m < 1000) return `${Math.max(50, Math.round(m / 50) * 50)} m`;
  return `${(Math.round(m / 100) / 10).toString().replace('.', ',')} km`;
}

// Hace 12 min · Hace 2 h · Ayer · Hace 3 días
export function ago(at: number, now: number) {
  const min = Math.max(0, Math.round((now - at) / 60000));
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const days = Math.round(h / 24);
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} días`;
  return new Date(at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// "5:40 p. m."
export function clock12(at: number) {
  const d = new Date(at);
  const h = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'a. m.' : 'p. m.'}`;
}

// "19 oct 2026" o, con hora, "19 oct, 5:40 p. m."
export function dayText(at: number, year = true) {
  const d = new Date(at);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}${year ? ` ${d.getFullYear()}` : ''}`;
}

export function whenText(at: number, dayOnly?: boolean) {
  return dayOnly ? dayText(at) : `${dayText(at, false)}, ${clock12(at)}`;
}

// Hora de publicación, para ordenar y para "Hace 12 min".
export function posted(r: Pick<Report, 'at' | 'postedAt'>) {
  return r.postedAt ?? r.at;
}

export function title(r: Report) {
  return r.title || r.petName;
}

export function speciesWord(r: Pick<Report, 'species'>) {
  return r.species === 'gato' ? 'Gato' : 'Perro';
}

export function initial(name?: string) {
  return (name?.trim()[0] ?? 'V').toUpperCase();
}

export const RADIUS = 2000; // metros: los vecinos a 2 km reciben el aviso
export const KM_STEPS = [1, 2, 5, 10, 25, 50, 100]; // kilómetros que se pueden elegir en Mascotas perdidas

export const SITUATIONS = [
  { id: 'herido', label: 'Herido' },
  { id: 'atropellado', label: 'Atropellado' },
  { id: 'quieto', label: 'No se mueve' },
  { id: 'atrapado', label: 'Atrapado' },
  { id: 'maltrato', label: 'Maltrato' },
  { id: 'otro', label: 'Otro' },
];

export const SIZES = [
  { id: 'pequeno', label: 'Pequeño' },
  { id: 'mediano', label: 'Mediano' },
  { id: 'grande', label: 'Grande' },
] as const;

// Reencuentros del barrio este año (de ejemplo hasta tener la nube) más los tuyos.
export const REUNIONS_YEAR = 38;
export const HELPERS_YEAR = 412;
