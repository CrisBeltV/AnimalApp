import { formatDate } from './health';
import type { ClinicalProfile, Entry, Pet } from './types';

// El expediente junta lo que tiene una historia clínica veterinaria: consultas, vacunas,
// tratamientos y documentos (radiografías, exámenes, fórmulas). Lo demás es cuidado diario.
export type ExpFilter = 'todo' | 'consulta' | 'vacuna' | 'tratamiento' | 'documento';

export const EXP_FILTERS: { id: ExpFilter; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'consulta', label: 'Consultas' },
  { id: 'vacuna', label: 'Vacunas' },
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
      return labelOf(CONSULT_TYPES, f.tipo) ? `Consulta · ${labelOf(CONSULT_TYPES, f.tipo)}` : 'Consulta';
    case 'vacuna':
      return f.nombre ? `Vacuna · ${f.nombre}` : 'Vacuna';
    case 'medicamento':
      return f.nombre || e.note || 'Tratamiento';
    case 'documento':
      return f.titulo || labelOf(DOC_TYPES, f.tipo) || 'Documento';
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
      return [labelOf(DOC_TYPES, f.tipo) && f.titulo ? labelOf(DOC_TYPES, f.tipo) : '', f.nota].filter(Boolean).join(' · ');
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
