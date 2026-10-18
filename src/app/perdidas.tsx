import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Button, T, when } from '../components/ui';
import { sampleReports } from '../lib/samples';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';
import type { ReportKind } from '../lib/types';
import { useNow } from '../lib/useNow';

type Tab = 'todas' | ReportKind;

export default function Perdidas() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const [tab, setTab] = useState<Tab>('todas');
  const all = [...data.reports, ...sampleReports(now)];
  const lost = all.filter((r) => r.kind === 'perdida');
  const found = all.filter((r) => r.kind === 'encontrada');
  const shown = tab === 'todas' ? all : tab === 'perdida' ? lost : found;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'todas', label: `Todas · ${all.length}` },
    { id: 'perdida', label: `Perdidas · ${lost.length}` },
    { id: 'encontrada', label: `Encontradas · ${found.length}` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Perdidas y encontradas" subtitle="Alertas a 2 km de ti" />
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.map}>
          <Svg width="100%" height="100%" viewBox="0 0 358 176" preserveAspectRatio="xMidYMid slice">
            <Rect width={358} height={176} fill={colors.grass} />
            {[10, 140, 260].map((x) => (
              <Rect key={`a${x}`} x={x} y={10} width={x === 260 ? 88 : x === 140 ? 90 : 100} height={60} rx={12} fill={colors.block} />
            ))}
            {[10, 140, 260].map((x) => (
              <Rect key={`b${x}`} x={x} y={100} width={x === 260 ? 88 : x === 140 ? 90 : 100} height={66} rx={12} fill={colors.block} />
            ))}
            <Rect x={110} y={0} width={30} height={176} fill={colors.road} />
            <Rect x={230} y={0} width={30} height={176} fill={colors.road} />
            <Rect x={0} y={70} width={358} height={30} fill={colors.road} />
            <Circle cx={179} cy={88} r={80} fill={colors.accent} fillOpacity={0.08} stroke={colors.accent} strokeWidth={2} strokeDasharray="6 6" />
            <Circle cx={179} cy={88} r={9} fill={colors.accent} stroke="#FFFFFF" strokeWidth={4} />
            <Circle cx={128} cy={52} r={11} fill={colors.lost} stroke="#FFFFFF" strokeWidth={4} />
            <Circle cx={236} cy={132} r={11} fill={colors.lost} stroke="#FFFFFF" strokeWidth={4} />
            <Circle cx={238} cy={40} r={11} fill={colors.found} stroke="#FFFFFF" strokeWidth={4} />
          </Svg>
          <View style={s.legend}>
            <View style={[s.dot, { backgroundColor: colors.lost }]} />
            <T.Black style={{ fontSize: 12 }}>Perdida</T.Black>
            <View style={[s.dot, { backgroundColor: colors.found, marginLeft: 6 }]} />
            <T.Black style={{ fontSize: 12 }}>Encontrada · 2 km</T.Black>
          </View>
        </View>

        <View accessibilityRole="tablist" style={s.tabs}>
          {tabs.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t.id }}
              onPress={() => setTab(t.id)}
              style={[s.tab, tab === t.id && { backgroundColor: colors.blue }]}
            >
              <T.Black style={{ fontSize: 13, color: tab === t.id ? colors.text : colors.textMuted }}>{t.label}</T.Black>
            </Pressable>
          ))}
        </View>

        {shown.map((r) => {
          const isLost = r.kind === 'perdida';
          return (
            <Pressable key={r.id} onPress={() => router.push({ pathname: '/reporte', params: { id: r.id } })} style={s.item}>
              <View style={[s.thumb, { backgroundColor: isLost ? '#F1E4D6' : colors.foundSoft }]}>
                <PetDrawing species={r.species} mood="normal" size={54} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <View style={[s.tag, { backgroundColor: isLost ? colors.lostSoft : colors.foundSoft }]}>
                    <Text style={[s.tagText, { color: isLost ? colors.lostText : colors.foundText }]}>
                      {isLost ? 'PERDIDA' : 'ENCONTRADA'}
                    </Text>
                  </View>
                  <T.Black>{r.petName}</T.Black>
                  {r.example ? <T.Muted style={{ fontSize: 12 }}>ejemplo</T.Muted> : null}
                </View>
                <T.Body style={{ fontSize: 14 }}>
                  {r.description} · {when(r.at)}
                </T.Body>
                <T.Muted style={{ fontSize: 13 }}>
                  {isLost ? '' : 'Encontrada en '}
                  {r.place}
                  {r.distance ? ` · a ${r.distance}` : ' · tu reporte'}
                </T.Muted>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[s.actions, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Se perdió mi mascota" kind="lost" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/reportar', params: { tipo: 'perdida' } })} />
        <Button label="Encontré una" kind="found" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/reportar', params: { tipo: 'encontrada' } })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 24, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  map: { height: 176, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.grass },
  legend: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 22, padding: 4 },
  tab: { flex: 1, minHeight: 44, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  item: { backgroundColor: colors.card, borderRadius: 20, padding: 10, flexDirection: 'row', gap: 12 },
  thumb: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tag: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: 'center' },
  tagText: { fontSize: 11, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
