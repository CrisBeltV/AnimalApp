import type { StyleSpecification } from '@maplibre/maplibre-react-native';

// Estilo "aventura" del mapa (spec: docs/adr/0001 y conversación del 2026-11-05).
// Parte del estilo streets-v2 de MapTiler y le cambia colores y capas. Es una función pura:
// recibe el estilo base y devuelve una copia, así se puede probar sin red.

// Paleta crema cálido (mapa de calles clásico, referencia FastPokeMap).
export const MAP_LAND = '#F6EBC9';
const PLACE_FILL = '#EDE0B5';
const GRASS_FILL = '#C9E4A8';
const WOODS_FILL = '#A9D08E';
const WATER = '#A9D4F0';
const ROAD = '#FFFFFF';
const ROAD_EDGE = '#CFC6A8';
const BUILDING_ROOF = '#FFFDF6';
const BUILDING_EDGE = '#D9CFAE';
const BUILDING_WALL = '#FFFDF6';
const LABEL = '#4A4231';
const LABEL_HALO = '#FFF8E1';

const KEEP_LABELS = new Set(['Park', 'Road labels', 'Place labels']);
const HIDE_LINES = /rail|border|aeroway|cablecar|ferry|aqueduct|tunnel/i;
const GRASS = new Set(['Meadow', 'Grass', 'Scrub', 'Crop']);
const WOODS = new Set(['Forest', 'Wood']);
const WATER_FILLS = new Set(['Water', 'Water intermittent']);
const PLACE_FILLS = new Set(['Industrial', 'Pedestrian', 'School', 'Hospital', 'Stadium', 'Cemetery', 'Sand']);
const ROAD_LINES = new Set(['Minor road', 'Major road', 'Highway', 'Path', 'Path minor', 'Pier road', 'Road under construction']);
const ROAD_EDGES = new Set(['Minor road outline', 'Major road outline', 'Highway outline', 'Path outline', 'Bridge outline']);

type Layer = StyleSpecification['layers'][number];

function restyle(layer: Layer): Layer {
  const { id, type } = layer;
  const paint = (layer.paint ?? {}) as Record<string, unknown>;
  const layout = (layer.layout ?? {}) as Record<string, unknown>;
  const set = (p: Record<string, unknown>, l: Record<string, unknown> = {}) =>
    ({ ...layer, paint: { ...paint, ...p }, layout: { ...layout, ...l } }) as Layer;

  if (type === 'background') return set({ 'background-color': MAP_LAND });
  if (type === 'symbol') {
    if (!KEEP_LABELS.has(id)) return set({}, { visibility: 'none' });
    return set({ 'text-color': LABEL, 'text-halo-color': LABEL_HALO, 'text-halo-width': 2 });
  }
  if (type === 'line') {
    if (ROAD_LINES.has(id)) return set({ 'line-color': ROAD });
    if (ROAD_EDGES.has(id)) return set({ 'line-color': ROAD_EDGE });
    if (HIDE_LINES.test(id)) return set({}, { visibility: 'none' });
    if (id === 'River') return set({ 'line-color': WATER });
    return layer;
  }
  if (type === 'fill-extrusion') {
    return {
      ...layer,
      minzoom: 14,
      filter: ['!', ['has', 'hide_3d']],
      paint: {
        'fill-extrusion-color': BUILDING_WALL,
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-height': ['*', ['coalesce', ['get', 'render_height'], 6], 1.3],
        'fill-extrusion-opacity': 0.92,
        'fill-extrusion-vertical-gradient': true,
      },
    } as Layer;
  }
  if (type === 'fill') {
    if (id === 'Building') {
      // El 3D toma el relevo desde el zoom 14.
      return {
        ...set({ 'fill-color': BUILDING_ROOF, 'fill-opacity': 0.9, 'fill-outline-color': BUILDING_EDGE }),
        maxzoom: 14,
      } as Layer;
    }
    if (WATER_FILLS.has(id)) return set({ 'fill-color': WATER, 'fill-opacity': 1 });
    if (GRASS.has(id)) return set({ 'fill-color': GRASS_FILL, 'fill-opacity': 0.95 });
    if (WOODS.has(id)) return set({ 'fill-color': WOODS_FILL, 'fill-opacity': 0.95 });
    if (PLACE_FILLS.has(id)) return set({ 'fill-color': PLACE_FILL, 'fill-opacity': 1 });
    if (id === 'Residential') return set({ 'fill-color': MAP_LAND });
  }
  return layer;
}

export function gameStyle(base: StyleSpecification): StyleSpecification {
  return {
    ...base,
    layers: base.layers.map(restyle),
    // Cielo y niebla: el horizonte se disuelve en vez de cortarse a 60° de inclinación.
    sky: {
      'sky-color': '#CFE8F7',
      'horizon-color': '#FBF3DA',
      'fog-color': '#FBF3DA',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.8,
      'fog-ground-blend': 0.9,
    },
  } as StyleSpecification;
}
