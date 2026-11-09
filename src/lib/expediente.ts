import { GROOMING, MOODS, WALK_TYPES } from './game';
import { FICHAS, SIGN_LABEL, formatDate, parseDate } from './health';
import type { ClinicalProfile, Entry, Park, Pet, Provider } from './types';

// El expediente junta lo que tiene una historia clínica veterinaria: consultas, vacunas,
// tratamientos y documentos (radiografías, exámenes, fórmulas). Lo demás es cuidado diario.
export type ExpFilter = 'todo' | 'consulta' | 'vacuna' | 'tratamiento' | 'documento';

export const EXP_FILTERS: { id: ExpFilter; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'consulta', label: 'Consultas' },
  { id: 'vacuna', label: 'Prevención' },
  { id: 'tratamiento', label: 'Tratamientos' },
  { id: 'documento', label: 'Documentos' },
];

const GROUP: Partial<Record<Entry['kind'], ExpFilter>> = {
  veterinario: 'consulta',
  vacuna: 'vacuna',
  medicamento: 'tratamiento',
  documento: 'documento',
};

export const CONSULT_TYPES = [
  { id: 'control', label: 'Control' },
  { id: 'urgencia', label: 'Urgencia' },
  { id: 'cirugia', label: 'Cirugía' },
  { id: 'accidente', label: 'Accidente' },
  { id: 'otro', label: 'Otro' },
];

export const DOC_TYPES = [
  { id: 'radiografia', label: 'Radiografía' },
  { id: 'laboratorio', label: 'Laboratorio' },
  { id: 'ecografia', label: 'Ecografía' },
  { id: 'formula', label: 'Fórmula' },
  { id: 'otro', label: 'Otro' },
];

const labelOf = (list: { id: string; label: string }[], id?: string) => list.find((x) => x.id === id)?.label;

// Con "Otro" se muestra lo que el dueño escribió.
export const typeLabel = (list: { id: string; label: string }[], f: Record<string, string> = {}) =>
  f.tipo === 'otro' && f.tipoOtro ? f.tipoOtro : labelOf(list, f.tipo);

export const isExpediente = (e: Entry) => GROUP[e.kind] !== undefined;

// Del más reciente al más antiguo. "Documentos" incluye también los adjuntos de otros registros.
export function expedienteEntries(entries: Entry[], filter: ExpFilter): Entry[] {
  const all = entries.filter(isExpediente);
  const list =
    filter === 'todo'
      ? all
      : filter === 'documento'
        ? all.filter((e) => e.kind === 'documento' || (e.files?.length ?? 0) > 0)
        : all.filter((e) => GROUP[e.kind] === filter);
  return [...list].sort((a, b) => b.at - a.at);
}

export function entryTitle(e: Entry): string {
  const f = e.fields ?? {};
  switch (e.kind) {
    case 'veterinario':
      return typeLabel(CONSULT_TYPES, f) ? `Consulta · ${typeLabel(CONSULT_TYPES, f)}` : 'Consulta';
    case 'vacuna':
      return `${labelOf(PREVENTION_TYPES, f.categoria) ?? 'Vacuna'}${f.nombre ? ` · ${f.nombre}` : ''}`;
    case 'medicamento':
      return f.nombre || e.note || 'Tratamiento';
    case 'documento':
      return f.titulo || typeLabel(DOC_TYPES, f) || 'Documento';
    default:
      return e.note ?? '';
  }
}

export function entryDetail(e: Entry): string {
  const f = e.fields ?? {};
  switch (e.kind) {
    case 'veterinario':
      return [f.veterinaria, f.doctor, f.motivo, f.nota].filter(Boolean).join(' · ');
    case 'vacuna':
      return [f.proxima ? `Refuerzo ${f.proxima}` : '', f.aplico, f.laboratorio].filter(Boolean).join(' · ');
    case 'medicamento':
      return [f.dosis, f.cadaHoras ? `cada ${f.cadaHoras} h` : '', f.fin ? `hasta ${f.fin}` : ''].filter(Boolean).join(' · ');
    case 'documento':
      return [typeLabel(DOC_TYPES, f) && f.titulo ? typeLabel(DOC_TYPES, f) : '', f.nota].filter(Boolean).join(' · ');
    default:
      return '';
  }
}

export const entryDay = (e: Entry) => formatDate(e.at);

export type ProfileLines = { basics: string; allergies?: string; conditions?: string; empty: boolean };

// Resumen de la ficha clínica para el encabezado del expediente y para el PDF.
export function profileLines(pet: Pet, clinical: ClinicalProfile | undefined, weight?: number): ProfileLines {
  const c = clinical ?? {};
  const neutered = c.neutered === 'si' ? (c.sex === 'macho' ? 'Esterilizado' : 'Esterilizada') : c.neutered === 'no' ? 'Sin esterilizar' : '';
  const basics = [
    pet.species === 'gato' ? 'Gato' : 'Perro',
    pet.breed,
    c.sex === 'hembra' ? 'Hembra' : c.sex === 'macho' ? 'Macho' : '',
    neutered,
    weight ? `${String(Math.round(weight * 10) / 10).replace('.', ',')} kg` : '',
    c.microchip ? `Chip ${c.microchip}` : '',
    c.marks,
  ]
    .filter(Boolean)
    .join(' · ');
  return {
    basics,
    allergies: c.allergies || undefined,
    conditions: c.conditions || undefined,
    empty: !c.sex && !c.neutered && !c.microchip && !c.marks && !c.allergies && !c.conditions,
  };
}

export const PREVENTION_TYPES = [
  { id: 'vacuna', label: 'Vacuna' },
  { id: 'desparasitacion', label: 'Desparasitante' },
  { id: 'antiparasitario', label: 'Antipulgas y garrapatas' },
];

// Tratamientos que siguen en curso: tienen fecha de fin y todavía no pasó.
export function activeTreatments(entries: Entry[], now: number): Entry[] {
  const today = new Date(now).setHours(0, 0, 0, 0);
  return entries.filter((e) => {
    const end = e.kind === 'medicamento' ? parseDate(e.fields?.fin) : null;
    return end !== null && end >= today;
  });
}

// La vacuna más reciente (los desparasitantes y antiparasitarios no cuentan).
export function lastVaccine(entries: Entry[]): Entry | undefined {
  return entries
    .filter((e) => e.kind === 'vacuna' && (!e.fields?.categoria || e.fields.categoria === 'vacuna'))
    .sort((a, b) => b.at - a.at)[0];
}

const VISIT_LABELS: [string, string][] = [
  ['veterinaria', 'Veterinaria'],
  ['doctor', 'Doctor'],
  ['direccion', 'Dirección'],
  ['ubicacion', 'Ubicación'],
  ['telefono', 'Teléfono'],
  ['motivo', 'Motivo'], // citas viejas
  ['proxima', 'Próxima cita'],
  ['nota', 'Lo que dijo el veterinario'],
];

const DOC_LABELS: [string, string][] = [['nota', 'Notas']];

export type PreviewCtx = { parks?: Park[]; providers?: Provider[] };
type Row = { label: string; value: string };

// Registros con hora (el resto se muestra solo con el día).
const TIMED: Entry['kind'][] = ['paseo', 'peso', 'agua', 'comida', 'animo', 'novedad', 'deposicion', 'enfermedad', 'lesion', 'nota'];

const pick = (f: Record<string, string>, list: [string, string][]): Row[] => list.filter(([k]) => f[k]).map(([k, label]) => ({ label, value: f[k] }));

// Datos de un registro para la vista previa: solo lo que se llenó, con su nombre y en orden.
export function previewRows(e: Entry, ctx: PreviewCtx = {}): Row[] {
  const f = e.fields ?? {};
  const time = new Date(e.at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  const date: Row = { label: 'Fecha', value: TIMED.includes(e.kind) ? `${formatDate(e.at)} · ${time}` : formatDate(e.at) };
  let rows: Row[];
  switch (e.kind) {
    case 'vacuna':
    case 'medicamento':
    case 'alimento':
      rows = pick(f, FICHAS[e.kind].fields.filter((x) => x.key !== 'nombre').map((x) => [x.key, x.label]));
      break;
    case 'documento':
      rows = pick(f, DOC_LABELS);
      break;
    case 'veterinario':
      rows = pick(f, VISIT_LABELS);
      break;
    case 'novedad':
    case 'deposicion':
    case 'enfermedad':
    case 'lesion':
      rows = [
        ...(e.signs?.length ? [{ label: 'Lo que notaste', value: e.signs.map((s) => SIGN_LABEL[s] ?? s).join(', ') }] : []),
        ...pick(f, [['lesionDonde', 'Dónde'], ['nota', 'Otra cosa que notaste']]),
      ];
      break;
    case 'paseo':
      rows = [
        ...(e.minutes ? [{ label: 'Duración', value: `${e.minutes} min` }] : []),
        ...(f.tipo && f.tipo !== 'paseo' ? [{ label: 'Tipo', value: WALK_TYPES.find((w) => w.id === f.tipo)?.label ?? f.tipo }] : []),
        ...(f.parqueId ? [{ label: 'Parque', value: ctx.parks?.find((p) => p.id === f.parqueId)?.name ?? '' }] : []),
      ].filter((r) => r.value);
      break;
    case 'peso':
      rows = [...(e.kg ? [{ label: 'Peso', value: `${String(e.kg).replace('.', ',')} kg` }] : []), ...pick(f, [['alto', 'Alto (cm)'], ['largo', 'Largo (cm)']])];
      break;
    case 'agua':
      rows = e.ml ? [{ label: 'Cantidad', value: `${e.ml} ml` }] : [];
      break;
    case 'higiene': {
      const tipos = (f.tipos ?? f.tipo ?? '').split(',').filter(Boolean);
      const label = tipos.map((id) => (id === 'otro' && f.otro ? f.otro : GROOMING.find((g) => g.id === id)?.label)).filter(Boolean).join(', ');
      rows = [
        ...(label ? [{ label: 'Cuidados', value: label }] : []),
        ...(f.peluqueriaId ? [{ label: 'Lo hizo', value: ctx.providers?.find((p) => p.id === f.peluqueriaId)?.name ?? '' }] : []),
        ...pick(f, [['proxima', 'Próxima vez'], ['nota', 'Notas']]),
      ].filter((r) => r.value);
      break;
    }
    case 'animo': {
      const mood = MOODS.find((m) => m.id === f.estado);
      rows = [...(mood ? [{ label: 'Estado', value: `${mood.icon} ${mood.label}` }] : []), ...pick(f, [['nota', 'Notas']])];
      break;
    }
    default:
      rows = [];
  }
  // Lo que no tiene datos sueltos (comida, diario, foto, registros viejos) muestra su nota.
  if (e.kind === 'comida' && e.note) rows.unshift({ label: 'Menú', value: e.note });
  else if (rows.length === 0 && e.note) rows.push({ label: 'Nota', value: e.note });
  else if (e.note && ['paseo', 'peso', 'agua', 'foto', 'nota'].includes(e.kind)) rows.push({ label: 'Nota', value: e.note });
  return [date, ...rows];
}
