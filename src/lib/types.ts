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

// Tipos de reporte de la comunidad. 'encontrada' es el nombre viejo de 'visto'
// (reportes guardados antes de la v9); se muestra igual que 'visto'.
export type ReportKind = 'perdida' | 'visto' | 'emergencia' | 'adopcion' | 'hogar' | 'encontrada';

// Un vecino vio la mascota del reporte: dónde y cuándo.
export type Sighting = {
  at: number;
  place: string;
  by: string;
  note?: string;
  photo?: boolean;
  x?: number; // lugar aproximado en el mapa del barrio (metros)
  y?: number;
};

export type ReportComment = { id: string; at: number; by: string; text: string; mine?: boolean };

// Datos de una mascota en adopción o que busca hogar temporal.
export type AdoptionInfo = {
  age?: string;
  size?: 'pequeno' | 'mediano' | 'grande';
  vacunada?: boolean;
  esterilizada?: boolean;
  desparasitada?: boolean;
  time?: string; // hogar temporal: por cuánto tiempo
};

// Reporte de la comunidad: mascota perdida, vista suelta, emergencia, adopción u hogar temporal.
// Con cuenta se publica en la nube; sin cuenta (y mientras la nube está en pausa) queda en el teléfono.
export type Report = {
  id: string;
  kind: ReportKind;
  at: number; // cuándo pasó (se perdió, se vio, la emergencia) o cuándo se publicó
  dayOnly?: boolean; // no se sabe la hora exacta: se muestra solo el día
  postedAt?: number; // cuándo se publicó (si es distinto de at)
  petName: string;
  title?: string; // título de la tarjeta: "Rocky · criollo café"
  species: Species;
  female?: boolean;
  description: string;
  place: string;
  barrio?: string;
  note?: string;
  withMe?: boolean; // visto o emergencia: la tengo conmigo
  by?: string; // nombre de quien publica (nunca su número ni su dirección)
  petInfo?: string; // "Perro criollo · macho · 3 años · mediano"
  traits?: string[];
  photos?: string[];
  photoCount?: number; // ejemplos: cuántas fotos tiene
  apoyos?: number;
  commentCount?: number;
  comments?: ReportComment[];
  sightings?: Sighting[];
  views?: number; // vecinos que lo vieron
  situations?: string[]; // emergencia: herido, atropellado…
  adoption?: AdoptionInfo;
  x?: number; // lugar aproximado en el mapa del barrio (metros desde tu ubicación)
  y?: number;
  closed?: boolean; // reencontrado o resuelto
  distance?: string; // solo en los ejemplos viejos
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

// Paseo recurrente: un objetivo guardado para repetirlo con un toque.
// id = goalKey del objetivo; hidden = el dueño lo quitó de la lista.
export type WalkRoutine = WalkGoal & { id: string; name: string; hidden?: boolean };

// Avisos diarios: horarios de comida y recordatorio de paseo.
export type Settings = {
  mealTimes: string[]; // "07:00"
  mealNames?: Record<string, string>; // nombre de cada horario: "Desayuno"
  mealOff?: string[]; // horarios guardados con el aviso apagado
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
  routines?: WalkRoutine[]; // paseos y entrenamientos recurrentes
  supported?: string[]; // reportes a los que diste apoyo ❤
  // Comentarios y avistamientos que escribiste en reportes de otros (también en los de ejemplo).
  reportExtras?: Record<string, { comments?: ReportComment[]; sightings?: Sighting[] }>;
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
