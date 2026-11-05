import type { Marker } from './BarrioMap';

// Pin del mapa: x e y en metros respecto a la mascota (igual que en BarrioMap).
// `anchor: 'bottom'` apoya el pie del pin en el punto (la mascota); por defecto va centrado.
export type MapMarker = Marker & { anchor?: 'center' | 'bottom' };

// Vista del mapa: 3d = cámara inclinada con edificios; 2d = plano visto desde arriba.
export type MapViewMode = '2d' | '3d';
