import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarrioMap } from '../components/BarrioMap';
import { FilterChips, KindBadge, ReportCard, ReportPhoto, ReportPin } from '../components/Reports';
import type { Filter } from '../components/Reports';
import { BackHeader, Button, T } from '../components/ui';
import { KM_STEPS, RADIUS, ago, posted, distanceText, kindOf, meters, spot, title } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, shadow, softShadow } from '../lib/theme';
import type { Report } from '../lib/types';
import { useNow } from '../lib/useNow';

function matches(r: Report, q: string) {
  if (!q) return true;
  const text = [r.title, r.petName, r.description, r.note, r.place, r.barrio, r.petInfo, ...(r.traits ?? [])].join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => text.includes(w));
}

// Mascotas perdidas: reportes de los vecinos a 2 km, en lista o en el mapa.
export default function Perdidas() {
  const params = useLocalSearchParams<{ vista?: string; id?: string }>();
  const { reports, refreshReports } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const [view, setView] = useState<'lista' | 'mapa'>(params.vista === 'mapa' ? 'mapa' : 'lista');
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(RADIUS);
  const [selected, setSelected] = useState<string | null>(params.id ?? null);
  useEffect(refreshReports, [refreshReports]);

  const near = reports(now)
    .filter((r) => !r.closed && meters(r) <= radius)
    .sort((a, b) => posted(b) - posted(a));
  const found = near.filter((r) => matches(r, query.trim()));
  const shown = found.filter((r) => filter === 'todos' || kindOf(r) === filter);
  const km = radius / 1000;
  const step = Math.max(0, KM_STEPS.indexOf(km));
  const current = shown.find((r) => r.id === selected) ?? null;
  const start = params.id ? near.find((r) => r.id === params.id) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Mascotas perdidas" subtitle={`${near.length} ${near.length === 1 ? 'reporte' : 'reportes'} a ${km} km · en vivo`} />
      <View style={s.segment} accessibilityRole="tablist">
        {(['lista', 'mapa'] as const).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === v }}
            onPress={() => setView(v)}
            style={[s.segBtn, view === v && s.segOn]}
          >
            <T.Black style={{ fontSize: 15, color: view === v ? '#FFFFFF' : colors.text }}>{v === 'lista' ? 'Reportes' : 'Mapa'}</T.Black>
          </Pressable>
        ))}
      </View>

      <View style={s.kmRow}>
        <T.Black style={{ fontSize: 14, color: colors.textMuted }}>Reportes a</T.Black>
        <View style={s.km}>
          <Pressable accessibilityLabel="Menos kilómetros" disabled={step === 0} onPress={() => setRadius(KM_STEPS[step - 1] * 1000)} style={[s.kmBtn, step === 0 && { opacity: 0.35 }]}>
            <Text style={s.kmSign}>−</Text>
          </Pressable>
          <Text accessibilityLabel="Distancia" style={s.kmValue}>
            {km} km
          </Text>
          <Pressable
            accessibilityLabel="Más kilómetros"
            disabled={step === KM_STEPS.length - 1}
            onPress={() => setRadius(KM_STEPS[step + 1] * 1000)}
            style={[s.kmBtn, step === KM_STEPS.length - 1 && { opacity: 0.35 }]}
          >
            <Text style={s.kmSign}>+</Text>
          </Pressable>
        </View>
      </View>

      {view === 'lista' ? (
        <>
          <View style={s.searchWrap}>
            <Text style={s.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Busca por descripción, raza o barrio"
              placeholderTextColor={colors.textMuted}
              style={s.search}
              accessibilityLabel="Buscar reportes"
            />
          </View>
          <View>
            <FilterChips value={filter} onChange={setFilter} list={found} />
          </View>
          <ScrollView contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 110 }]}>
            {shown.map((r) => (
              <ReportCard key={r.id} report={r} now={now} />
            ))}
            {shown.length === 0 ? (
              <T.Muted style={{ textAlign: 'center', paddingVertical: 20 }}>
                {query ? 'Ningún reporte coincide con tu búsqueda.' : 'No hay reportes de este tipo cerca.'}
              </T.Muted>
            ) : null}
            <View style={s.footer}>
              <T.Muted style={{ textAlign: 'center' }}>Eso es todo a {km} km.</T.Muted>
              {step < KM_STEPS.length - 1 ? (
                <Pressable onPress={() => setRadius(KM_STEPS[step + 1] * 1000)} style={s.wider}>
                  <T.Black style={{ color: colors.accent }}>Ampliar a {KM_STEPS[step + 1]} km</T.Black>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/nuevo-reporte')}
            style={[s.fab, shadow, { bottom: insets.bottom + 20 }]}
          >
            <Text style={s.fabPlus}>+</Text>
            <Text style={s.fabText}>Crear un reporte</Text>
          </Pressable>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <BarrioMap
            initialWidth={start ? 1400 : 3400}
            center={start ? spot(start) : undefined}
            controlsBottom={current ? 250 + insets.bottom : 90 + insets.bottom}
            overlay={
              <Circle cx={0} cy={0} r={radius} fill={colors.accent} fillOpacity={0.06} stroke={colors.accent} strokeWidth={10} strokeDasharray="40 30" />
            }
            markers={[
              {
                id: 'tu',
                x: 0,
                y: 0,
                node: (
                  <View style={{ alignItems: 'center' }}>
                    <View style={s.me} />
                    <View style={[s.meLabel, softShadow]}>
                      <Text style={s.meText}>Tú</Text>
                    </View>
                  </View>
                ),
              },
              ...shown.map((r) => ({
                id: r.id,
                ...spot(r),
                node: <ReportPin report={r} selected={r.id === selected} onPress={() => setSelected(r.id)} />,
              })),
            ]}
          />
          <View style={s.mapFilters}>
            <FilterChips value={filter} onChange={setFilter} list={near} />
          </View>
          {current ? (
            <View style={[s.sheet, shadow, { paddingBottom: insets.bottom + 14 }]}>
              <Pressable accessibilityLabel="Cerrar reporte" onPress={() => setSelected(null)} style={s.handleArea}>
                <View style={s.handle} />
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 86 }}>
                  <ReportPhoto report={current} height={86} size={70} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <KindBadge report={current} small />
                    <T.Muted style={{ fontSize: 12 }}>{ago(posted(current), now).toLowerCase()}</T.Muted>
                  </View>
                  <T.Black style={{ fontSize: 17 }} numberOfLines={1}>
                    {title(current)}
                  </T.Black>
                  <T.Muted style={{ fontSize: 13 }} numberOfLines={2}>
                    {current.place} · a {distanceText(meters(current))} de ti
                  </T.Muted>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {kindOf(current) === 'perdida' ? (
                  <Button
                    label="Lo vi"
                    kind="found"
                    style={{ flex: 1 }}
                    onPress={() => router.push({ pathname: '/reportar', params: { tipo: 'visto', para: current.id } })}
                  />
                ) : null}
                <Button label="Ver reporte" kind="solid" style={{ flex: 1.3 }} onPress={() => router.push({ pathname: '/reporte', params: { id: current.id } })} />
                <Pressable accessibilityLabel="Crear un reporte" onPress={() => router.push('/nuevo-reporte')} style={s.plus}>
                  <Text style={s.plusText}>+</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View pointerEvents="none" style={[s.hint, softShadow, { bottom: insets.bottom + 24 }]}>
              <T.Black style={{ fontSize: 13 }}>Toca un pin para ver el reporte · {shown.length} en la zona</T.Black>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 4,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  segBtn: { flex: 1, height: 42, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.accent },
  kmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 10 },
  km: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: 22, padding: 3, borderWidth: 1.5, borderColor: colors.blueOutline },
  kmBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  kmSign: { fontSize: 22, fontWeight: '700', color: colors.accent, lineHeight: 24 },
  kmValue: { minWidth: 70, textAlign: 'center', fontFamily: fonts.display, fontWeight: '700', fontSize: 18, color: colors.text },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.grey,
    gap: 8,
  },
  searchIcon: { fontSize: 20, color: colors.textMuted },
  search: { flex: 1, height: 46, fontSize: 15, fontFamily: fonts.body, color: colors.body, ...({ outlineStyle: 'none' } as object) },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  footer: { alignItems: 'center', gap: 8, paddingVertical: 10 },
  wider: { paddingHorizontal: 18, height: 42, borderRadius: 21, borderWidth: 2, borderColor: colors.blueOutline, backgroundColor: colors.blue, justifyContent: 'center' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
    paddingHorizontal: 22,
    borderRadius: 28,
    backgroundColor: colors.accent,
  },
  fabPlus: { color: '#FFFFFF', fontSize: 26, fontWeight: '700', lineHeight: 28 },
  fabText: { color: '#FFFFFF', fontSize: 16, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  mapFilters: { position: 'absolute', top: 8, left: 0, right: 0 },
  me: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, borderWidth: 4, borderColor: '#FFFFFF' },
  meLabel: { marginTop: 4, paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  meText: { fontSize: 11, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.accent },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    gap: 12,
  },
  handleArea: { alignItems: 'center', paddingTop: 8, paddingBottom: 2 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.grey },
  plus: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blue, borderWidth: 2, borderColor: colors.blueOutline, alignItems: 'center', justifyContent: 'center' },
  plusText: { fontSize: 26, fontWeight: '700', color: colors.accent, lineHeight: 28 },
  hint: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', justifyContent: 'center' },
});
