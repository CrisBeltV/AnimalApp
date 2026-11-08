// Campos de cada ficha de salud. "required" = necesario para cerrar el registro;
// si falta, la vista previa pide completarlo antes de guardar.
export type Field = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  date?: boolean; // DD/MM/AAAA
  multiline?: boolean;
  number?: boolean;
  remind?: string; // si tiene fecha, se ofrece recordatorio con este texto
  lookup?: boolean; // dato general que se podrá autocompletar desde internet
  group?: string; // título de un grupo de campos, como la tabla nutricional
};

export const VACUNA_FIELDS: Field[] = [
  { key: 'nombre', label: 'Nombre de la vacuna', placeholder: 'Rabia, Polivalente, Triple felina', required: true },
  { key: 'fecha', label: 'Fecha de vacunación', placeholder: 'DD/MM/AAAA', required: true, date: true },
  { key: 'proxima', label: 'Próxima dosis o refuerzo', placeholder: 'DD/MM/AAAA', date: true, remind: 'Próxima dosis' },
  { key: 'laboratorio', label: 'Laboratorio', placeholder: 'Nombre del fabricante' },
  { key: 'lote', label: 'Lote', placeholder: 'Número de lote del sticker' },
  { key: 'caducidad', label: 'Fecha de caducidad', placeholder: 'DD/MM/AAAA', date: true },
  { key: 'protege', label: 'Contra qué protege', placeholder: 'Rabia, moquillo, parvovirus…', lookup: true, multiline: true },
  { key: 'aplico', label: 'Quién la aplicó', placeholder: 'Veterinaria o doctor' },
  { key: 'nota', label: 'Notas', placeholder: 'Reacción, peso ese día…', multiline: true },
];

export const MEDICAMENTO_FIELDS: Field[] = [
  { key: 'nombre', label: 'Nombre del medicamento', placeholder: 'Desparasitante, antibiótico…', required: true },
  { key: 'dosis', label: 'Cantidad o dosis', placeholder: '1 tableta, 5 gotas, 2 ml', required: true },
  { key: 'cadaHoras', label: 'Cada cuántas horas', placeholder: '8', number: true },
  { key: 'inicio', label: 'Fecha de inicio', placeholder: 'DD/MM/AAAA', required: true, date: true },
  { key: 'fin', label: 'Fin del tratamiento', placeholder: 'DD/MM/AAAA', date: true, remind: 'Fin del tratamiento' },
  { key: 'caducidad', label: 'Fecha de caducidad', placeholder: 'DD/MM/AAAA', date: true, remind: 'Se vence el medicamento' },
  { key: 'ingredientes', label: 'Ingredientes o principio activo', placeholder: 'Lo que dice la caja', multiline: true },
  { key: 'funciones', label: 'Para qué sirve', placeholder: 'Funciones o indicaciones', multiline: true, lookup: true },
  { key: 'contraindicaciones', label: 'Contraindicaciones', placeholder: 'Cuándo no darlo', multiline: true, lookup: true },
  { key: 'presentacion', label: 'Presentación', placeholder: 'Tabletas, gotas, jarabe, inyección' },
  { key: 'receto', label: 'Quién lo recetó', placeholder: 'Veterinaria o doctor' },
  { key: 'nota', label: 'Notas', placeholder: 'Darlo con comida, reacciones…', multiline: true },
];

export const ALIMENTO_FIELDS: Field[] = [
  { key: 'nombre', label: 'Marca y nombre', placeholder: 'Marca, línea, sabor', required: true },
  { key: 'tipo', label: 'Tipo', placeholder: 'Seco, húmedo, snack, casero' },
  { key: 'porcion', label: 'Porción por comida (gramos)', placeholder: '150', number: true, required: true },
  { key: 'comidasDia', label: 'Comidas al día', placeholder: '2', number: true },
  { key: 'bolsaKg', label: 'Tamaño del empaque (kg)', placeholder: '8', number: true },
  { key: 'apertura', label: 'Fecha en que lo abriste', placeholder: 'DD/MM/AAAA', required: true, date: true },
  { key: 'caducidad', label: 'Fecha de caducidad', placeholder: 'DD/MM/AAAA', date: true, remind: 'Se vence el alimento' },
  { key: 'kcalKg', label: 'Energía (kcal por kg)', placeholder: '3600', number: true, group: 'Tabla nutricional del empaque' },
  { key: 'proteina', label: 'Proteína (%)', placeholder: '25', number: true, group: 'Tabla nutricional del empaque' },
  { key: 'grasa', label: 'Grasa (%)', placeholder: '14', number: true, group: 'Tabla nutricional del empaque' },
  { key: 'fibra', label: 'Fibra (%)', placeholder: '3,5', number: true, group: 'Tabla nutricional del empaque' },
  { key: 'humedad', label: 'Humedad (%)', placeholder: '10', number: true, group: 'Tabla nutricional del empaque' },
  { key: 'ingredientes', label: 'Ingredientes', placeholder: 'Lo que dice el empaque', multiline: true },
  { key: 'recomendada', label: 'Porción recomendada en el empaque', placeholder: 'Según el peso de la mascota', multiline: true },
  { key: 'nota', label: 'Notas', placeholder: 'Le gusta, le cae mal…', multiline: true },
];

export type FichaKind = 'vacuna' | 'medicamento' | 'alimento';

// Cómo se ve cada ficha con fotos y vista previa.
export const FICHAS: Record<FichaKind, { fields: Field[]; dateKey: string; newTitle: string; what: string; photosTitle: string; sides: string[] }> = {
  vacuna: {
    fields: VACUNA_FIELDS,
    dateKey: 'fecha',
    newTitle: 'Nueva vacuna',
    what: 'Vacuna',
    photosTitle: 'Fotos del carnet de vacunación',
    sides: ['Frente del carnet', 'Reverso del carnet'],
  },
  medicamento: {
    fields: MEDICAMENTO_FIELDS,
    dateKey: 'inicio',
    newTitle: 'Nuevo medicamento',
    what: 'Medicamento',
    photosTitle: 'Fotos de la caja o el frasco',
    sides: ['Frente de la caja', 'Reverso de la caja'],
  },
  alimento: {
    fields: ALIMENTO_FIELDS,
    dateKey: 'apertura',
    newTitle: 'Alimento nuevo',
    what: 'Alimento',
    photosTitle: 'Fotos de la bolsa o la lata',
    sides: ['Frente del empaque', 'Reverso del empaque'],
  },
};

export function fichaKind(kind?: string): FichaKind {
  return kind === 'medicamento' || kind === 'alimento' ? kind : 'vacuna';
}

// Fechas escritas como DD/MM/AAAA (también acepta - o .). Devuelve medianoche local o null.
export function parseDate(text?: string): number | null {
  if (!text) return null;
  const m = text.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (!m) return null;
  const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
  const d = new Date(year, Number(m[2]) - 1, Number(m[1]));
  if (d.getDate() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1) return null;
  return d.getTime();
}

export function formatDate(t: number) {
  const d = new Date(t);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export const REMIND_OPTIONS = [
  { id: 'dia', label: '1 día antes', days: 1 },
  { id: 'semana', label: '1 semana antes', days: 7 },
  { id: 'mes', label: '1 mes antes', days: 30 },
] as const;

// Novedades o comportamiento inusual (antes: deposiciones, síntomas y lesiones).
export const SIGN_GROUPS: { title: string; signs: { id: string; label: string }[] }[] = [
  {
    title: 'Deposiciones',
    signs: [
      { id: 'normales', label: 'Normales' },
      { id: 'duras', label: 'Duras, secas o en bolitas pequeñas' },
      { id: 'blandas', label: 'Muy blandas, pastosas o líquidas' },
      { id: 'moco', label: 'Con presencia de moco' },
    ],
  },
  {
    title: 'Comida y boca',
    signs: [
      { id: 'apetito', label: 'Falta de apetito' },
      { id: 'vomito', label: 'Vómito' },
      { id: 'babeo', label: 'Babeo' },
    ],
  },
  {
    title: 'Movimientos anormales',
    signs: [
      { id: 'temblores', label: 'Temblores' },
      { id: 'desorientacion', label: 'Desorientación' },
      { id: 'cojera', label: 'Cojera' },
    ],
  },
  {
    title: 'Lesiones',
    signs: [{ id: 'lesion', label: 'Lesión o herida' }],
  },
];

export const SIGN_LABEL: Record<string, string> = Object.fromEntries(
  SIGN_GROUPS.flatMap((g) => g.signs.map((s) => [s.id, s.label])),
);
