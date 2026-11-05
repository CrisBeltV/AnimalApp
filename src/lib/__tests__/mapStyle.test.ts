/* eslint-disable @typescript-eslint/no-explicit-any -- el estilo de MapLibre es JSON libre */
import type { StyleSpecification } from '@maplibre/maplibre-react-native';

import { gameStyle } from '../mapStyle';

const base = {
  version: 8,
  sources: {},
  layers: [
    { id: 'Background', type: 'background', paint: { 'background-color': '#fff' } },
    { id: 'Water', type: 'fill', source: 's', 'source-layer': 'water', paint: { 'fill-color': '#00f' } },
    { id: 'Grass', type: 'fill', source: 's', 'source-layer': 'landcover', paint: { 'fill-color': '#0f0' } },
    { id: 'Minor road', type: 'line', source: 's', 'source-layer': 'transportation', paint: { 'line-color': '#fff' } },
    { id: 'Major rail', type: 'line', source: 's', 'source-layer': 'transportation', paint: {} },
    { id: 'Building 3D', type: 'fill-extrusion', source: 's', 'source-layer': 'building', paint: {} },
    { id: 'Park', type: 'symbol', source: 's', 'source-layer': 'poi', layout: {}, paint: {} },
    { id: 'Shopping', type: 'symbol', source: 's', 'source-layer': 'poi', layout: {}, paint: {} },
  ],
} as unknown as StyleSpecification;

const out = gameStyle(base);
const layer = (id: string) => out.layers.find((l) => l.id === id) as unknown as Record<string, any>;

describe('gameStyle', () => {
  it('no cambia el estilo base', () => {
    expect(layer('Shopping').layout.visibility).toBe('none');
    expect((base.layers[2] as any).paint['fill-color']).toBe('#0f0');
  });

  it('pinta tierra, agua, parques y calles con la paleta del juego', () => {
    expect(layer('Background').paint['background-color']).toBe('#F6EBC9');
    expect(layer('Water').paint['fill-color']).toBe('#A9D4F0');
    expect(layer('Grass').paint['fill-color']).toBe('#C9E4A8');
    expect(layer('Minor road').paint['line-color']).toBe('#FFFFFF');
  });

  it('oculta etiquetas de comercios y vías de tren, pero deja los parques', () => {
    expect(layer('Shopping').layout.visibility).toBe('none');
    expect(layer('Major rail').layout.visibility).toBe('none');
    expect(layer('Park').layout.visibility).toBeUndefined();
  });

  it('extruye los edificios desde el zoom 14 y exagera la altura', () => {
    const b = layer('Building 3D');
    expect(b.minzoom).toBe(14);
    expect(b.paint['fill-extrusion-height'][0]).toBe('*');
    expect(b.paint['fill-extrusion-height'][2]).toBe(1.3);
  });

  it('agrega cielo y niebla', () => {
    expect((out as any).sky['fog-color']).toBeDefined();
  });
});
