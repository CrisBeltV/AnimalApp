export type Species = 'perro' | 'gato';

export type Pet = {
  name: string;
  species: Species;
  breed: string;
  birthDate?: string; // AAAA-MM-DD
  createdAt: number;
};

export type EntryKind =
  | 'comida'
  | 'agua'
  | 'paseo'
  | 'peso'
  | 'deposicion'
  | 'medicamento'
  | 'vacuna'
  | 'veterinario'
  | 'enfermedad'
  | 'lesion'
  | 'nota';

export type Entry = {
  id: string;
  kind: EntryKind;
  at: number; // marca de tiempo en milisegundos
  minutes?: number; // paseo
  kg?: number; // peso
  ml?: number; // agua
  note?: string;
  xp: number;
};

export type ReportKind = 'perdida' | 'encontrada';

// Reporte de mascota perdida o encontrada. Por ahora queda en el teléfono;
// con la nube se enviará a los vecinos a 2 km.
export type Report = {
  id: string;
  kind: ReportKind;
  at: number;
  petName: string;
  species: Species;
  description: string;
  place: string;
  note?: string;
  withMe?: boolean; // encontrada: la tengo conmigo
  distance?: string; // solo en los ejemplos
  example?: boolean;
};

export type AppData = {
  ownerName: string;
  pet: Pet | null;
  entries: Entry[];
  reports: Report[];
  activeWalkStart: number | null;
  unlocked: string[]; // ids de logros ya ganados
};

export const emptyData: AppData = {
  ownerName: '',
  pet: null,
  entries: [],
  reports: [],
  activeWalkStart: null,
  unlocked: [],
};
