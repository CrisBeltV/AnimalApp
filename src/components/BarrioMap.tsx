import { memo, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Svg, { G, Line, Polygon, Rect } from 'react-native-svg';

import { AREAS, CALLES, CARRERAS, GRID_ANGLE, MAP_LIMIT, MAX_WIDTH, MIN_WIDTH, PLACES, blocks, fromGrid, minorStreets } from '../lib/barrio';
import type { Road } from '../lib/barrio';
import { colors, fonts, softShadow } from '../lib/theme';

// maxWidth: el pin se esconde cuando el mapa está más lejos que eso (metros de ancho).
export type Marker = { id: string; x: number; y: number; node: ReactNode; maxWidth?: number };

const C = {
  ground: '#BFEBC5',
  block: '#DDF5DF',
  park: '#93DCA3',
  street: '#F7F3E3',
  streetEdge: '#E2DBC0',
  main: '#FFFFFF',
  mainEdge: '#D3DAE3',
  water: '#9FD3F0',
  airport: '#E4DEF5',
  airportLine: '#CBBFEA',
};

const WIDTH = { via: 26, principal: 16, calle: 9 };

// El dibujo no cambia: se hace una sola vez y solo se mueve la "cámara" (viewBox).
const Art = memo(function Art() {
  const cells = useMemo(blocks, []);
  const minor = useMemo(minorStreets, []);
  const road = (r: Road, calle: boolean, edge: boolean) => {
    const w = WIDTH[r.size] + (edge ? 3 : 0);
    const color = edge ? (r.size === 'calle' ? C.streetEdge : C.mainEdge) : r.size === 'calle' ? C.street : C.main;
    return calle ? (
      <Line key={`${r.name}${edge}`} x1={r.from} y1={r.at} x2={r.to} y2={r.at} stroke={color} strokeWidth={w} strokeLinecap="round" />
    ) : (
      <Line key={`${r.name}${edge}`} x1={r.at} y1={r.from} x2={r.at} y2={r.to} stroke={color} strokeWidth={w} strokeLinecap="round" />
    );
  };
  const poly = (pts: readonly (readonly number[])[]) => pts.map((p) => p.join(',')).join(' ');
  return (
    <>
      <Rect x={-6000} y={-6000} width={12000} height={12000} fill={C.ground} />
      <G transform={`rotate(${GRID_ANGLE})`}>
        {cells.map((b, i) => (
          <Rect key={i} x={b.gx + 7} y={b.gy + 7} width={b.w - 14} height={b.h - 14} rx={6} fill={b.park ? C.park : C.block} />
        ))}
        {/* Canal junto a la Calle 66A */}
        <Line x1={-1600} y1={-158} x2={2000} y2={-158} stroke={C.water} strokeWidth={10} />
        {minor.map((m, i) => (
          <Line key={`m${i}`} x1={m.gx1} y1={m.gy1} x2={m.gx2} y2={m.gy2} stroke={C.street} strokeWidth={6} />
        ))}
      </G>
      {/* El aeropuerto y el humedal tapan las calles que no llegan hasta allá. */}
      <Polygon points={poly(AREAS.aeropuerto)} fill={C.airport} stroke={C.airportLine} strokeWidth={6} />
      <Polygon points={poly(AREAS.humedal)} fill={C.water} />
      <G transform={`rotate(${GRID_ANGLE})`}>
        {CARRERAS.map((r) => road(r, false, true))}
        {CALLES.map((r) => road(r, true, true))}
        {CARRERAS.filter((r) => r.size === 'calle').map((r) => road(r, false, false))}
        {CALLES.filter((r) => r.size === 'calle').map((r) => road(r, true, false))}
        {CARRERAS.filter((r) => r.size !== 'calle').map((r) => road(r, false, false))}
        {CALLES.filter((r) => r.size !== 'calle').map((r) => road(r, true, false))}
      </G>
    </>
  );
});

// Dónde poner el nombre de cada calle en pantalla: el punto de la vía más cercano al centro.
function streetLabels(cx: number, cy: number, w: number) {
  const r = (GRID_ANGLE * Math.PI) / 180;
  const gx = cx * Math.cos(r) + cy * Math.sin(r);
  const gy = -cx * Math.sin(r) + cy * Math.cos(r);
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  return [
    ...CALLES.map((c) => ({ road: c, angle: GRID_ANGLE, ...fromGrid(clamp(gx + w * 0.22, c.from + 60, c.to - 60), c.at) })),
    ...CARRERAS.map((c) => ({ road: c, angle: GRID_ANGLE - 90, ...fromGrid(c.at, clamp(gy - w * 0.3, c.from + 60, c.to - 60)) })),
  ];
}

// Mapa dibujado del barrio: se arrastra para moverlo y se acerca o aleja con los botones
// (o con dos dedos en el teléfono). Los marcadores se dibujan encima en su lugar del mapa.
export function BarrioMap({
  markers = [],
  initialWidth = 700,
  interactive = true,
  controlsBottom = 16,
  focusY = 0.5,
  center = { x: 0, y: 0 },
  overlay,
  style,
}: {
  markers?: Marker[];
  initialWidth?: number;
  interactive?: boolean;
  controlsBottom?: number;
  focusY?: number; // a qué altura de la pantalla (0 arriba, 1 abajo) queda el centro del mapa
  center?: { x: number; y: number }; // dónde arranca el mapa (metros); ◎ siempre vuelve a tu ubicación
  overlay?: ReactNode; // dibujo extra en metros, encima del mapa (por ejemplo el radio de 2 km)
  style?: StyleProp<ViewStyle>;
}) {
  const [size, setSize] = useState({ w: 390, h: 600 });
  const [cam, setCam] = useState({ x: center.x, y: center.y, w: initialWidth });
  const camRef = useRef(cam);
  camRef.current = cam;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const start = useRef({ x: 0, y: 0, w: initialWidth, dist: 0 });

  const clampCam = (c: { x: number; y: number; w: number }) => ({
    w: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, c.w)),
    x: Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, c.x)),
    y: Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, c.y)),
  });

  const pinch = (e: GestureResponderEvent) => {
    const t = e.nativeEvent.touches;
    if (!t || t.length < 2) return 0;
    return Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        // Al arrastrar, el mapa se mueve aunque el dedo empiece sobre un pin.
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          start.current = { ...camRef.current, dist: pinch(e) };
        },
        onPanResponderMove: (e, g) => {
          const scale = sizeRef.current.w / start.current.w;
          const d = pinch(e);
          if (d && start.current.dist) {
            setCam(clampCam({ ...camRef.current, w: (start.current.w * start.current.dist) / d }));
            return;
          }
          setCam(clampCam({ w: start.current.w, x: start.current.x - g.dx / scale, y: start.current.y - g.dy / scale }));
        },
      }),
    [],
  );

  const zoom = (k: number) => setCam((c) => clampCam({ ...c, w: c.w * k }));
  // Una pantalla escondida mide 0: se ignora para no dañar el dibujo.
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ w: width, h: height });
  };

  const scale = size.w / cam.w; // píxeles por metro
  const viewH = size.h / scale;
  const toScreen = (x: number, y: number) => ({ left: (x - cam.x) * scale + size.w / 2, top: (y - cam.y) * scale + size.h * focusY });
  const inView = (p: { left: number; top: number }, m = 40) => p.left > -m && p.left < size.w + m && p.top > -m && p.top < size.h + m;

  // Qué nombres se ven según qué tan cerca está el mapa.
  const showStreets = cam.w <= 1300;
  const showMinorNames = cam.w <= 650;
  const showBarrios = cam.w >= 900;
  const labels = showStreets ? streetLabels(cam.x, cam.y, cam.w).filter((l) => showMinorNames || l.road.size !== 'calle') : [];
  const meters = [10, 20, 50, 100, 200, 500, 1000, 2000].find((m) => m * scale >= 60) ?? 2000;

  return (
    <View style={[StyleSheet.absoluteFill, style]} onLayout={onLayout} {...(interactive ? responder.panHandlers : {})}>
      <Svg style={StyleSheet.absoluteFill} viewBox={`${cam.x - cam.w / 2} ${cam.y - viewH * focusY} ${cam.w} ${viewH}`} preserveAspectRatio="xMidYMid slice">
        <Art />
        {overlay}
      </Svg>

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {labels.map((l) => {
          const p = toScreen(l.x, l.y);
          if (!inView(p, 0)) return null;
          return (
            <Text
              key={l.road.name}
              style={[
                s.street,
                l.road.size !== 'calle' && s.mainStreet,
                { left: p.left - 70, top: p.top - 8, transform: [{ rotate: `${l.angle}deg` }] },
              ]}
            >
              {l.road.name}
            </Text>
          );
        })}
        {PLACES.filter((pl) => (pl.kind === 'barrio' ? showBarrios : cam.w <= 2600)).map((pl) => {
          const p = toScreen(pl.x, pl.y);
          if (!inView(p)) return null;
          return (
            <Text key={pl.name} style={[pl.kind === 'barrio' ? s.barrio : s.place, { left: p.left - 80, top: p.top - 8 }]}>
              {pl.name}
            </Text>
          );
        })}
      </View>

      {markers.map((m) => {
        const p = toScreen(m.x, m.y);
        if (!inView(p, 120) || (m.maxWidth && cam.w > m.maxWidth)) return null;
        return (
          <View key={m.id} pointerEvents="box-none" style={[s.marker, { left: p.left, top: p.top }]}>
            <View pointerEvents="box-none" style={s.markerInner}>
              {m.node}
            </View>
          </View>
        );
      })}

      {interactive && (
        <View style={[s.controls, { bottom: controlsBottom }]}>
          <Pressable accessibilityLabel="Acercar mapa" onPress={() => zoom(0.5)} style={[s.ctrl, softShadow]}>
            <Text style={s.ctrlText}>+</Text>
          </Pressable>
          <Pressable accessibilityLabel="Alejar mapa" onPress={() => zoom(2)} style={[s.ctrl, softShadow]}>
            <Text style={s.ctrlText}>−</Text>
          </Pressable>
          <Pressable accessibilityLabel="Volver al centro" onPress={() => setCam({ x: 0, y: 0, w: initialWidth })} style={[s.ctrl, softShadow]}>
            <Text style={[s.ctrlText, { fontSize: 18 }]}>◎</Text>
          </Pressable>
        </View>
      )}
      {interactive && (
        <View pointerEvents="none" style={[s.scale, { bottom: controlsBottom }]}>
          <View style={[s.scaleBar, { width: meters * scale }]} />
          <Text style={s.scaleText}>{meters >= 1000 ? `${meters / 1000} km` : `${meters} m`}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  street: {
    position: 'absolute',
    width: 140,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    color: '#5C6B7E',
    textShadowColor: '#FFFFFF',
    textShadowRadius: 3,
  },
  mainStreet: { fontSize: 12, color: colors.text },
  barrio: {
    position: 'absolute',
    width: 160,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1.5,
    fontFamily: fonts.bodyBlack,
    fontWeight: '800',
    color: '#3E5A48',
    textShadowColor: '#FFFFFF',
    textShadowRadius: 4,
  },
  place: {
    position: 'absolute',
    width: 160,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    color: colors.lilacText,
    textShadowColor: '#FFFFFF',
    textShadowRadius: 4,
  },
  marker: { position: 'absolute', width: 0, height: 0, overflow: 'visible' },
  markerInner: { position: 'absolute', left: -100, top: -100, width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', right: 16, gap: 8 },
  ctrl: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  ctrlText: { fontSize: 24, fontWeight: '700', color: colors.text, lineHeight: 26 },
  scale: { position: 'absolute', left: 16, gap: 2 },
  scaleBar: { height: 4, borderRadius: 2, backgroundColor: colors.text, opacity: 0.6 },
  scaleText: { fontSize: 11, fontFamily: fonts.bodyBold, fontWeight: '700', color: colors.text },
});
