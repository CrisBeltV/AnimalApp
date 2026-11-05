import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Camera,
  type CameraRef,
  type GeolocationPosition,
  type MapRef,
  LocationManager,
  Map,
  type StyleSpecification,
  ViewAnnotation,
} from '@maplibre/maplibre-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { markerScale, offsetLngLat } from '../lib/geo';
import { MAP_LAND, gameStyle } from '../lib/mapStyle';
import { colors } from '../lib/theme';
import type { MapMarker, MapViewMode } from './petMapTypes';

type LngLat = [number, number];
type Fix = { ll: LngLat; accuracy: number; ageMs: number; fresh: boolean };

const KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${KEY}`;
const BOGOTA: LngLat = [-74.0817, 4.6097];
const LAST_POS_KEY = 'animaapp:lastpos';
const pitchFor = (view: MapViewMode) => (view === '3d' ? 60 : 0);
const zoomFor = (view: MapViewMode) => (view === '3d' ? 18 : 17);
const FRESH_MS = 20_000; // una posición más vieja que esto puede ser la "última conocida" de otro lugar
const GOOD_M = 100; // y una menos precisa que esto no sirve para centrar el mapa
const SLOW_GPS_MS = 10_000;

async function loadStyle(): Promise<StyleSpecification> {
  const res = await fetch(STYLE_URL);
  if (!res.ok) throw new Error(`MapTiler respondió ${res.status}`);
  return gameStyle(await res.json());
}

function toFix(p: GeolocationPosition): Fix {
  const ageMs = Date.now() - p.timestamp;
  const accuracy = p.coords.accuracy ?? 0;
  return {
    ll: [p.coords.longitude, p.coords.latitude],
    accuracy,
    ageMs,
    fresh: ageMs < FRESH_MS && accuracy <= GOOD_M,
  };
}

// Mapa de aventura. Abre sobre la mascota: en la última posición guardada si la hay y, apenas
// llega un GPS fresco, salta ahí. Después la cámara la sigue hasta que el dueño mueve el mapa;
// 📍 vuelve a seguirla. La mascota siempre está en la posición real del GPS.
export function PetMap({
  markers,
  view = '3d',
  onViewChange,
  controlsBottom = 16,
}: {
  markers: MapMarker[];
  view?: MapViewMode;
  onViewChange?: (view: MapViewMode) => void;
  controlsBottom?: number;
}) {
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapRef>(null);
  const jumped = useRef(false);
  const prevView = useRef(view);
  const [style, setStyle] = useState<StyleSpecification | null>(null);
  const [error, setError] = useState<string | null>(
    KEY ? null : 'Falta EXPO_PUBLIC_MAPTILER_KEY en .env.local (y reiniciar Expo).',
  );
  const [fix, setFix] = useState<Fix | null>(null);
  const [saved, setSaved] = useState<LngLat | null>(null);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [noGps, setNoGps] = useState(false);
  const [follow, setFollow] = useState(true);
  const [zoom, setZoom] = useState(zoomFor(view));

  useEffect(() => {
    if (!KEY) return;
    loadStyle().then(setStyle, (e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(LAST_POS_KEY)
      .then((raw) => raw && setSaved(JSON.parse(raw) as LngLat))
      .catch(() => {})
      .finally(() => setSavedLoaded(true));
  }, []);

  useEffect(() => {
    let alive = true;
    let listener: ((p: GeolocationPosition) => void) | null = null;
    const timer = setTimeout(() => alive && setSlow(true), SLOW_GPS_MS);
    LocationManager.requestPermissions().then((ok) => {
      if (!alive) return;
      if (!ok) {
        setNoGps(true);
        return;
      }
      LocationManager.setMinDisplacement(3);
      listener = (p) => {
        const f = toFix(p);
        setFix(f);
        if (f.fresh) AsyncStorage.setItem(LAST_POS_KEY, JSON.stringify(f.ll)).catch(() => {});
      };
      LocationManager.addListener(listener);
    });
    return () => {
      alive = false;
      clearTimeout(timer);
      if (listener) LocationManager.removeListener(listener);
    };
  }, []);

  // Dónde arranca la cámara: GPS fresco > última posición guardada > (solo sin GPS) Bogotá.
  const start: LngLat | null = fix?.fresh ? fix.ll : savedLoaded && saved ? saved : noGps ? BOGOTA : null;
  const me: LngLat | null = fix?.ll ?? start;

  // Primer GPS fresco: salto directo (sin animar). Después, seguimiento suave.
  useEffect(() => {
    if (!fix?.fresh) return;
    if (!jumped.current) {
      jumped.current = true;
      camera.current?.jumpTo({ center: fix.ll, zoom: zoomFor(view) });
    } else if (follow) {
      camera.current?.easeTo({ center: fix.ll, duration: 800 });
    }
  }, [fix, follow, view]);

  // Cambio 2D/3D: la cámara se inclina o se pone vertical con una transición corta.
  useEffect(() => {
    if (prevView.current === view) return;
    prevView.current = view;
    map.current?.getCenter().then((center) =>
      camera.current?.easeTo({
        center,
        pitch: pitchFor(view),
        zoom: zoomFor(view),
        ...(view === '2d' && { bearing: 0 }),
        duration: 600,
      }),
    );
  }, [view]);

  function recenter() {
    if (!fix) return;
    setFollow(true);
    camera.current?.flyTo({ center: fix.ll, zoom: zoomFor(view), duration: 900 });
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!style || !start || !me) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.hint}>Buscando tu ubicación…</Text>
        {slow && (
          <>
            <Text style={styles.sub}>Todavía sin señal. Probá cerca de una ventana o al aire libre.</Text>
            <Pressable onPress={() => setNoGps(true)}>
              <Text style={styles.link}>Continuar sin GPS</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Map
        ref={map}
        style={styles.fill}
        mapStyle={style}
        onRegionDidChange={(e) => setZoom(Math.round(e.nativeEvent.zoom * 4) / 4)}
        onRegionWillChange={(e) => {
          // Solo cuenta como "el dueño movió el mapa" cuando ya estamos sobre el GPS.
          if (jumped.current && e.nativeEvent.userInteraction) setFollow(false);
        }}
      >
        <Camera
          ref={camera}
          initialViewState={{ center: start, zoom: zoomFor(view), pitch: pitchFor(view), bearing: 0 }}
          minZoom={view === '3d' ? 15.5 : 14.5}
          maxZoom={19}
        />
        {markers.map((m) => (
          <ViewAnnotation key={m.id} id={m.id} lngLat={offsetLngLat(me, m.x, m.y)} anchor={m.anchor ?? 'center'}>
            <View
              collapsable={false}
              style={{ transform: [{ scale: markerScale(zoom, zoomFor(view)) }], transformOrigin: m.anchor === 'bottom' ? 'bottom' : 'center' }}
            >
              {m.node}
            </View>
          </ViewAnnotation>
        ))}
      </Map>
      {(!fix?.fresh || __DEV__) && (
        <View style={[styles.chip, { bottom: controlsBottom }]} pointerEvents="none">
          <Text style={styles.chipText}>
            {!fix
              ? noGps
                ? 'Sin GPS · mostrando Bogotá'
                : 'Esperando GPS…'
              : `GPS ±${Math.round(fix.accuracy)} m · hace ${Math.round(fix.ageMs / 1000)} s${fix.fresh ? '' : ' (vieja)'}`}
          </Text>
        </View>
      )}
      {onViewChange && (
        <Pressable
          accessibilityLabel={view === '3d' ? 'Cambiar a vista 2D' : 'Cambiar a vista 3D'}
          style={[styles.btn, { bottom: controlsBottom + 62 }]}
          onPress={() => onViewChange(view === '3d' ? '2d' : '3d')}
        >
          <Text style={styles.viewText}>{view === '3d' ? '2D' : '3D'}</Text>
        </Pressable>
      )}
      <Pressable
        accessibilityLabel="Volver a mi ubicación"
        style={[styles.btn, { bottom: controlsBottom }, follow && styles.btnOn]}
        onPress={recenter}
        disabled={!fix}
      >
        <Text style={styles.btnText}>📍</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10, backgroundColor: MAP_LAND },
  error: { color: colors.bad, textAlign: 'center' },
  hint: { color: colors.text, fontWeight: '700' },
  sub: { color: colors.textMuted, textAlign: 'center' },
  link: { color: colors.accent, fontWeight: '700', textDecorationLine: 'underline' },
  chip: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  btn: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.blueOutline,
  },
  btnOn: { borderColor: colors.lilacStrong },
  btnText: { fontSize: 22 },
  viewText: { fontSize: 16, fontWeight: '800', color: colors.text },
});
