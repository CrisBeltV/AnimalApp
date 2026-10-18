import type { Report } from './types';

// Reportes de ejemplo (los de la maqueta) para ver cómo se verá la sección
// mientras no hay nube. Se marcan como ejemplo en pantalla.
const HOUR = 60 * 60 * 1000;

export function sampleReports(now: number): Report[] {
  return [
    {
      id: 'ej-rocky',
      kind: 'perdida',
      at: now - 0.5 * HOUR,
      petName: 'Rocky',
      species: 'perro',
      description: 'Criollo café, collar rojo',
      place: 'Parque Villa Luz',
      distance: '600 m',
      example: true,
    },
    {
      id: 'ej-mishi',
      kind: 'perdida',
      at: now - 21 * HOUR,
      petName: 'Mishi',
      species: 'gato',
      description: 'Gata gris, ojos verdes',
      place: 'Los Álamos',
      distance: '1,4 km',
      example: true,
    },
    {
      id: 'ej-blanco',
      kind: 'encontrada',
      at: now - 1.8 * HOUR,
      petName: 'Perrito blanco',
      species: 'perro',
      description: 'Pequeño, sin collar',
      place: 'Ciudadela Colsubsidio',
      distance: '1,1 km',
      example: true,
    },
  ];
}
