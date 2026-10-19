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
  | 'novedad'
  | 'alimento'
  | 'higiene'
  | 'foto'
  | 'animo'
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
  // Fichas de vacuna, medicamento y veterinario: campo -> valor escrito.
  fields?: Record<string, string>;
  // Fotos del carnet o de la caja (frente y reverso).
  photos?: string[];
  // Novedades o comportamiento inusual marcados.
  signs?: string[];
};

// Recordatorio agendado al terminar un registro (1 día, 1 semana o 1 mes antes).
export type Reminder = {
  id: string;
  entryId: string;
  title: string;
  at: number; // fecha del aviso; en las tomas, desde cuándo empieza
  everyHours?: number; // tomas de un medicamento: se repite cada tantas horas
  notificationId?: string;
};

// Veterinaria guardada por el dueño. Más adelante se unirá con las veterinarias
// y tiendas registradas como aliadas en la app.
export type Vet = {
  id: string;
  name: string;
  address?: string;
  place?: string;
  doctor?: string;
  phone?: string;
};

export type ReportKind = 'perdida' | 'encontrada';

// Reporte de mascota perdida o encontrada. Con cuenta se publica en la nube
// y lo ven los demás dueños; sin cuenta queda solo en el teléfono.
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
  cloudId?: string; // id en la nube, si se publicó
  mine?: boolean; // false: reporte de otro dueño
};

// Parque registrado por el dueño. Los minutos de paseo ahí cuentan para conquistarlo.
export type Park = {
  id: string;
  name: string;
  barrio?: string;
  features?: string[]; // zona canina, agua, sombra…
  rating?: number; // 1 a 5, tu calificación
  note?: string;
};

// Proveedores guardados por el dueño (paseadores, guarderías, tiendas, peluquerías).
// Más adelante se unirán con las cuentas de aliados registrados en la app.
export type ProviderType = 'paseador' | 'guarderia' | 'tienda' | 'peluqueria' | 'restaurante' | 'otro';

export type Provider = {
  id: string;
  type: ProviderType;
  name: string;
  contact?: string;
  address?: string;
  place?: string;
  phone?: string;
};

// Objetivo que se elige antes de salir a pasear.
export type WalkGoal = {
  tipo: string; // paseo, juego, entrenamiento, guardería
  minutes?: number;
  km?: number; // se medirá con GPS
  parqueId?: string; // parque a conquistar
  explorar?: boolean; // visitar un parque nuevo
};

// Avisos diarios: horarios de comida y recordatorio de paseo.
export type Settings = {
  mealTimes: string[]; // "07:00"
  walkTime?: string; // "18:00"
  notifIds: Record<string, string>; // aviso agendado por horario
};

export type AppData = {
  ownerName: string;
  pet: Pet | null;
  entries: Entry[];
  reports: Report[];
  activeWalkStart: number | null;
  walkGoal?: WalkGoal; // objetivo del paseo en curso
  unlocked: string[]; // ids de logros ya ganados
  reminders: Reminder[];
  vets: Vet[];
  parks: Park[];
  providers: Provider[];
  settings: Settings;
  updatedAt: number; // último cambio, para saber qué copia es más nueva
};

export const emptyData: AppData = {
  ownerName: '',
  pet: null,
  entries: [],
  reports: [],
  activeWalkStart: null,
  unlocked: [],
  reminders: [],
  vets: [],
  parks: [],
  providers: [],
  settings: { mealTimes: [], notifIds: {} },
  updatedAt: 0,
};
