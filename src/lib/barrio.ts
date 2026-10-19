// Mapa dibujado del barrio Los Álamos (Engativá, Bogotá), hecho a partir de un video de mapa.
// Medidas en metros. El centro (0, 0) es el punto donde arranca el mapa; x crece al oriente
// y y hacia el sur, como en la pantalla. Las calles del barrio forman una cuadrícula girada:
// las calles bajan hacia la derecha y las carreras suben hacia la derecha.
// Es una representación aproximada, no un plano exacto; el GPS real llega después.

export const GRID_ANGLE = 33; // grados que gira la cuadrícula del barrio

const rad = (GRID_ANGLE * Math.PI) / 180;
const cos = Math.cos(rad);
const sin = Math.sin(rad);

// De la cuadrícula del barrio (gx a lo largo de las calles, gy a lo largo de las carreras) al mapa.
export function fromGrid(gx: number, gy: number) {
  return { x: gx * cos - gy * sin, y: gx * sin + gy * cos };
}

export type Road = { name?: string; at: number; from: number; to: number; size: 'via' | 'principal' | 'calle' };

// Calles: líneas de gy fijo. Más al norte (gy negativo) los números suben.
export const CALLES: Road[] = [
  { name: 'Calle 72', at: -1490, from: -1700, to: 2000, size: 'via' },
  { name: 'Calle 70', at: -620, from: -1100, to: 1400, size: 'calle' },
  { name: 'Calle 69', at: -520, from: -1100, to: 1400, size: 'calle' },
  { name: 'Calle 68', at: -420, from: -1100, to: 1400, size: 'calle' },
  { name: 'Calle 67', at: -260, from: -1100, to: 1400, size: 'calle' },
  { name: 'Calle 66A', at: -140, from: -1600, to: 2000, size: 'via' },
  { name: 'Calle 66', at: 0, from: -1000, to: 1400, size: 'principal' },
  { name: 'Calle 65A', at: 80, from: -900, to: 1400, size: 'calle' },
  { name: 'Calle 65', at: 200, from: -900, to: 1400, size: 'calle' },
  { name: 'Calle 64G', at: 290, from: -700, to: 1400, size: 'calle' },
  { name: 'Calle 64D', at: 390, from: -500, to: 1400, size: 'calle' },
  { name: 'Avenida Calle 63', at: 520, from: -2200, to: 2400, size: 'via' },
];

// Carreras: líneas de gx fijo. Hacia el occidente (gx negativo) los números suben.
export const CARRERAS: Road[] = [
  { name: 'Carrera 103', at: -820, from: -1500, to: 330, size: 'calle' },
  { name: 'Carrera 101', at: -640, from: -1500, to: 420, size: 'calle' },
  { name: 'Carrera 100', at: -520, from: -1300, to: 470, size: 'calle' },
  { name: 'Carrera 99', at: -410, from: -1300, to: 500, size: 'calle' },
  { name: 'Carrera 98A', at: -300, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 98', at: -200, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 97A', at: -100, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 97', at: 0, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 96A', at: 90, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 96', at: 180, from: -1600, to: 540, size: 'principal' },
  { name: 'Carrera 95', at: 300, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 94', at: 420, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 93', at: 540, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 92', at: 680, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 91', at: 820, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 90', at: 960, from: -1300, to: 520, size: 'calle' },
  { name: 'Carrera 88', at: 1120, from: -1300, to: 520, size: 'calle' },
  { name: 'Avenida Ciudad de Cali', at: 1450, from: -2200, to: 1600, size: 'via' },
];

// Calles y carreras sin nombre que completan la cuadrícula del barrio.
const EXTRA_X = [-1450, -1300, -1150, -1000, 1280, 1620, 1780, 1940];
const EXTRA_Y = [-1900, -1810, -1720, -1630, -1400, -1310, -1220, -1130, -1040, -950, -860, -770, 600, 690, 780];

function inside(x: number, y: number, pts: readonly (readonly number[])[]) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function urban(gx: number, gy: number) {
  const { x, y } = fromGrid(gx, gy);
  return !inside(x, y, AREAS.aeropuerto) && !inside(x, y, AREAS.humedal) && Math.hypot(x, y) < 2600;
}

export function minorStreets() {
  const list: { gx1: number; gy1: number; gx2: number; gy2: number }[] = [];
  const calles = CALLES.filter((c) => c.at > -1400 && c.at < 500).map((c) => c.at);
  for (let i = 0; i < calles.length - 1; i++) {
    const mid = (calles[i] + calles[i + 1]) / 2;
    if (calles[i + 1] - calles[i] > 120) list.push({ gx1: -1000, gy1: mid, gx2: 1400, gy2: mid });
  }
  for (const gy of EXTRA_Y) list.push({ gx1: -1500, gy1: gy, gx2: 2000, gy2: gy });
  for (const gx of EXTRA_X) list.push({ gx1: gx, gy1: -1950, gx2: gx, gy2: 820 });
  return list;
}

// Manzanas: rectángulos entre calles y carreras (con un borde para el andén).
export function blocks() {
  const ys = [...new Set([...CALLES.map((c) => c.at), ...EXTRA_Y, -1950, 820])].sort((a, b) => a - b);
  const xs = [...new Set([...CARRERAS.map((c) => c.at), ...EXTRA_X, -1600, 2100])].sort((a, b) => a - b);
  const out: { gx: number; gy: number; w: number; h: number; park: boolean }[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const w = xs[i + 1] - xs[i];
      const h = ys[j + 1] - ys[j];
      if (h < 30 || !urban(xs[i] + w / 2, ys[j] + h / 2)) continue;
      // Algunas manzanas son zonas verdes, repartidas de forma fija.
      const park = (i * 7 + j * 13) % 23 === 0;
      out.push({ gx: xs[i], gy: ys[j], w, h, park });
    }
  }
  return out;
}

// Zonas grandes en coordenadas del mapa (x, y en metros).
export const AREAS = {
  aeropuerto: [
    [-2600, -400],
    [-700, 200],
    [-150, 900],
    [-400, 1700],
    [-2600, 1700],
  ],
  humedal: [
    [-2600, -2600],
    [-1350, -2500],
    [-1150, -1900],
    [-1500, -1300],
    [-1750, -700],
    [-2600, -650],
  ],
} as const;

// Nombres de barrios y lugares conocidos que se ven al alejar el mapa.
export const PLACES: { name: string; x: number; y: number; kind: 'barrio' | 'lugar' }[] = [
  { name: 'LOS ÁLAMOS', x: -420, y: 60, kind: 'barrio' },
  { name: 'ÁLAMOS', x: 60, y: -560, kind: 'barrio' },
  { name: 'EL MUELLE', x: -900, y: -600, kind: 'barrio' },
  { name: 'ÁLAMOS NORTE', x: 650, y: -1450, kind: 'barrio' },
  { name: 'SANTA ROSITA', x: 1300, y: -1250, kind: 'barrio' },
  { name: 'BOSQUES DE MARIANA', x: -1050, y: -2000, kind: 'barrio' },
  { name: 'ENGATIVÁ', x: 1350, y: -1950, kind: 'barrio' },
  { name: 'PUERTA DE TEJA', x: -1150, y: 1600, kind: 'barrio' },
  { name: 'Aeropuerto El Dorado', x: -1500, y: 700, kind: 'lugar' },
  { name: 'Portal de Los Álamos', x: 30, y: 200, kind: 'lugar' },
  { name: 'Diverplaza', x: 570, y: -1090, kind: 'lugar' },
  { name: 'Nuestro Bogotá', x: 600, y: 1330, kind: 'lugar' },
];

export const MAP_LIMIT = 2500; // hasta dónde se puede mover el mapa desde el centro
export const MIN_WIDTH = 40; // lo más cerca: unos 40 m de ancho en pantalla
export const MAX_WIDTH = 5000; // lo más lejos: todo el sector

// Posición fija pero aproximada para un lugar guardado, hasta tener GPS.
export function spotFor(id: string, radius = 600) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const angle = ((h % 360) * Math.PI) / 180;
  const dist = 80 + ((h >> 9) % 1000) / 1000 * radius;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}
