import type { Report } from './types';

// Reportes de ejemplo (los de la maqueta aprobada) para ver cómo se verá la sección
// mientras no hay nube. Se marcan como ejemplo en pantalla. x, y: metros desde tu ubicación.
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function sampleReports(now: number): Report[] {
  const rocky = now - 45 * MIN;
  return [
    {
      id: 'ej-rocky',
      kind: 'perdida',
      at: rocky,
      by: 'Andrea Gómez',
      petName: 'Rocky',
      title: 'Rocky · criollo café',
      species: 'perro',
      description: 'Se soltó del collar en el parque. Lleva bandana roja, es miedoso y responde a su nombre.',
      note: 'Se soltó del collar cuando pasó una moto. Es miedoso: no lo persigas, llámalo por su nombre y ofrécele comida. Lleva bandana roja.',
      petInfo: 'Perro criollo · macho · 3 años · mediano',
      traits: ['Bandana roja', 'Oreja izquierda caída', 'Miedoso', 'Microchip'],
      place: 'Parque Villa Luz',
      barrio: 'Villa Luz',
      x: -300,
      y: -520,
      photoCount: 3,
      apoyos: 24,
      views: 412,
      commentCount: 6,
      comments: [
        { id: 'c1', at: now - 20 * MIN, by: 'Marta', text: 'Pasó corriendo por la panadería de la 114, iba hacia el caño. Subí foto al hilo.' },
        { id: 'c2', at: now - 15 * MIN, by: 'Camila', text: 'Comparto en el grupo del conjunto. ¡Ánimo, Andrea!' },
      ],
      sightings: [
        { at: rocky, place: 'Se perdió en el Parque Villa Luz', by: 'Andrea, su familia', x: -300, y: -520 },
        { at: rocky + 25 * MIN, place: 'Lo vieron cruzando la Calle 72', by: 'Juan · vecino a 300 m', x: -180, y: -690 },
        { at: rocky + 40 * MIN, place: 'Lo vieron cerca a la panadería de la 114', by: 'Marta', photo: true, x: -40, y: -780 },
      ],
      example: true,
    },
    {
      id: 'ej-gatito',
      kind: 'emergencia',
      at: now - 12 * MIN,
      by: 'Jorge P.',
      petName: 'Gatito herido',
      title: 'Gatito herido bajo un carro',
      species: 'gato',
      description: 'Cojea de una pata trasera y no deja que lo toquen. Estoy con él, necesito una transportadora.',
      situations: ['herido', 'atrapado'],
      withMe: true,
      place: 'Cra. 98 con Calle 64D',
      barrio: 'Los Álamos',
      x: -760,
      y: 480,
      photoCount: 2,
      apoyos: 31,
      views: 230,
      commentCount: 12,
      example: true,
    },
    {
      id: 'ej-blanco',
      kind: 'visto',
      at: now - 2 * HOUR,
      by: 'Sofía R.',
      petName: 'Perrito blanco',
      title: 'Perrito blanco sin collar',
      species: 'perro',
      description: 'Lo vi en la entrada del Éxito de la Ciudadela, parecía perdido. Lo tengo en la casa.',
      withMe: true,
      traits: ['Pequeño', 'Sin collar'],
      place: 'Entrada del Éxito de la Ciudadela',
      barrio: 'Ciudadela Colsubsidio',
      x: 880,
      y: -660,
      photoCount: 1,
      apoyos: 15,
      views: 180,
      commentCount: 5,
      example: true,
    },
    {
      id: 'ej-mishi',
      kind: 'perdida',
      at: now - 22 * HOUR,
      by: 'Laura M.',
      petName: 'Mishi',
      title: 'Mishi · gata gris',
      species: 'gato',
      female: true,
      description: 'Ojos verdes, muy tímida. Salió por la ventana del 3.er piso.',
      petInfo: 'Gata · hembra · 2 años · pequeña',
      traits: ['Ojos verdes', 'Tímida', 'Collar con cascabel'],
      place: 'Los Álamos',
      barrio: 'Los Álamos',
      x: -1220,
      y: -730,
      photoCount: 4,
      apoyos: 19,
      views: 260,
      commentCount: 6,
      example: true,
    },
    {
      id: 'ej-canela',
      kind: 'adopcion',
      at: now - 3 * DAY,
      by: 'Fundación Huellitas',
      petName: 'Canela',
      title: 'Canela busca familia',
      species: 'perro',
      female: true,
      description: '2 años, vacunada y esterilizada. Muy cariñosa con niños.',
      adoption: { age: '2 años', size: 'mediano', vacunada: true, esterilizada: true, desparasitada: true },
      place: 'Engativá Pueblo',
      barrio: 'Engativá Pueblo',
      x: 1100,
      y: -1425,
      photoCount: 5,
      apoyos: 42,
      views: 520,
      commentCount: 9,
      example: true,
    },
    {
      id: 'ej-luna',
      kind: 'hogar',
      at: now - 4 * DAY,
      by: 'Diego A.',
      petName: 'Luna',
      title: 'Luna y sus 3 cachorros',
      species: 'perro',
      female: true,
      description: 'Necesitan hogar temporal por 3 semanas mientras se recuperan. Ayudamos con comida.',
      adoption: { age: 'Adulta y cachorros de 1 mes', size: 'mediano', vacunada: false, desparasitada: true, time: '3 semanas' },
      place: 'Villa Luz',
      barrio: 'Villa Luz',
      x: 420,
      y: -560,
      photoCount: 2,
      apoyos: 27,
      views: 300,
      commentCount: 4,
      example: true,
    },
  ];
}

// Perfil público de quien publica: nunca lleva su número ni su dirección.
export type Neighbor = {
  barrio: string;
  since: string;
  verified?: string; // 'Vecina verificada'
  reports: number;
  apoyos: number;
  reunions: number;
  closed: { title: string; badge: 'REENCONTRADO' | 'AYUDADO'; detail: string }[];
};

export const NEIGHBORS: Record<string, Neighbor> = {
  'Andrea Gómez': {
    barrio: 'Villa Luz',
    since: '2026',
    verified: 'Vecina verificada',
    reports: 3,
    apoyos: 41,
    reunions: 2,
    closed: [{ title: 'Bruno volvió a casa', badge: 'REENCONTRADO', detail: '12 oct · en 6 horas' }],
  },
  'Jorge P.': {
    barrio: 'Los Álamos',
    since: '2026',
    verified: 'Vecino verificado',
    reports: 2,
    apoyos: 35,
    reunions: 1,
    closed: [{ title: 'Perrita atropellada', badge: 'AYUDADO', detail: 'Llegó a la veterinaria a tiempo' }],
  },
  'Fundación Huellitas': {
    barrio: 'Engativá',
    since: '2026',
    verified: 'Fundación verificada',
    reports: 14,
    apoyos: 310,
    reunions: 9,
    closed: [
      { title: 'Toby encontró familia', badge: 'REENCONTRADO', detail: 'Adoptado el 2 oct' },
      { title: 'Nieve encontró familia', badge: 'REENCONTRADO', detail: 'Adoptada el 20 sep' },
    ],
  },
};

export const STORIES = [
  { pet: 'Bruno', title: 'Bruno volvió en 6 horas', quote: 'Una vecina lo reconoció por la foto del reporte y me escribió por el chat.', by: 'Andrea · Villa Luz', species: 'perro' as const },
  { pet: 'Kira', title: 'Kira apareció en el techo', quote: 'El mapa nos mostró que la habían visto a dos cuadras. ¡Gracias, comunidad!', by: 'Felipe · Los Álamos', species: 'gato' as const },
];
