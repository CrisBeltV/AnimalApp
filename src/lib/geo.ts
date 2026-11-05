const M_PER_DEG_LAT = 111_320;

// Los pines del demo vienen en metros respecto a la mascota (x hacia el este, y hacia el sur,
// como en pantalla). Los pasa a [longitud, latitud] a partir de la posición real.
export function offsetLngLat(origin: [number, number], x: number, y: number): [number, number] {
  const [lng, lat] = origin;
  return [lng + x / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)), lat - y / M_PER_DEG_LAT];
}

// Escala de los pines según el zoom: tamaño normal en el zoom de arranque, más chicos al alejar
// (hasta 45 %) y un poco más grandes al acercar (hasta 110 %), para que no dominen el mapa.
export function markerScale(zoom: number, baseZoom: number): number {
  return Math.min(1.1, Math.max(0.45, 1 - (baseZoom - zoom) * 0.22));
}
