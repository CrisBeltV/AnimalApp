import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Icon } from '../components/Icon';
import { Island } from '../components/Island';
import { Bar, Button } from '../components/ui';
import { allParks, isDay } from '../lib/parks';
import type { ParkInfo } from '../lib/parks';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

const DAY = { bg: '#D6EAFB', title: '#0F2540', sub: '#5B6676', card: '#FFFFFF', path: '#FFFFFF' };
const NIGHT = { bg: '#1F2A3A', title: '#FFFFFF', sub: '#C9B6F2', card: '#2B3950', path: '#4B3A78' };

// Tus lugares: cada parque es una isla por conquistar. De día o de noche según la hora (o el botón).
export default function Lugares() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const [now] = useState(() => Date.now());
  const [day, setDay] = useState(() => isDay(now));
  const parks = allParks(data, now);
  const mine = parks.filter((p) => p.status === 'mio').length;
  const t = day ? DAY : NIGHT;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Sky day={day} />
      <ScrollView contentContainerStyle={[s.page, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30 }]}>
        <View style={s.head}>
          <Pressable accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parques'))} style={[s.back, { backgroundColor: t.card }]}>
            <Icon name="atras" size={22} strokeWidth={2.4} color={day ? colors.text : '#FFFFFF'} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: t.title }]}>Tus lugares</Text>
            <Text style={[s.sub, { color: t.sub }]}>Cada parque es una isla por conquistar</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={day ? 'Ver de noche' : 'Ver de día'}
            accessibilityState={{ checked: !day }}
            onPress={() => setDay(!day)}
            style={[s.toggle, { backgroundColor: t.card }]}
          >
            <Text style={{ fontSize: 20 }}>{day ? '🌙' : '☀️'}</Text>
          </Pressable>
        </View>

        <View style={[s.progress, { backgroundColor: t.card }]}>
          <View style={s.row}>
            <Text style={[s.progLabel, { color: t.title }]}>Conquistados</Text>
            <Text style={[s.progNum, { color: t.title }]}>
              {mine} de {parks.length}
            </Text>
          </View>
          <Bar value={parks.length ? (mine / parks.length) * 100 : 0} color={colors.lilacStrong} track={day ? colors.lilacSoft : '#3A4A63'} />
          <Text style={[s.sub, { color: t.sub, fontSize: 12 }]}>Un parque es tuyo cuando paseas 60 min en él durante el mes.</Text>
        </View>

        {parks.length === 0 ? (
          <View style={{ gap: 12, alignItems: 'center', paddingTop: 20 }}>
            <Island size={180} />
            <Text style={[s.sub, { color: t.sub, textAlign: 'center' }]}>Aún no tienes parques. Añádelos desde el mapa de Conquista de parques.</Text>
            <Button label="Volver al mapa" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parques'))} />
          </View>
        ) : (
          <View style={{ gap: 4 }}>
            {parks.map((p, i) => (
              <View key={p.park.id}>
                {i > 0 ? <Trail left={i % 2 === 1} color={t.path} /> : null}
                <View style={{ alignItems: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                  <IslandCard info={p} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function IslandCard({ info }: { info: ParkInfo }) {
  const chip =
    info.status === 'mio'
      ? { text: `Tuyo · ${info.month} min este mes`, bg: colors.accent, color: '#FFFFFF' }
      : info.status === 'progreso'
        ? { text: `Conquista ${info.pct} %`, bg: '#FFFFFF', color: colors.accent }
        : { text: 'Libre', bg: '#FFFFFF', color: colors.textMuted };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${info.park.name}, ${chip.text}`}
      onPress={() => router.push({ pathname: '/parque', params: { id: info.park.id } })}
      style={s.island}
    >
      <Island size={160} flag={info.status === 'mio'} />
      <View style={s.plate}>
        <Text style={s.plateText} numberOfLines={1}>
          {info.park.name}
        </Text>
      </View>
      <View style={[s.chip, { backgroundColor: chip.bg }]}>
        <Text style={[s.chipText, { color: chip.color }]}>{chip.text}</Text>
      </View>
    </Pressable>
  );
}

// Camino punteado que une una isla con la siguiente (en zigzag).
function Trail({ left, color }: { left: boolean; color: string }) {
  return (
    <Svg width="100%" height={40} viewBox="0 0 300 40" preserveAspectRatio="none">
      <Path d={left ? 'M80 0 C 120 30, 180 10, 220 40' : 'M220 0 C 180 30, 120 10, 80 40'} stroke={color} strokeWidth={4} strokeDasharray="8 8" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// Fondo: nubes y sol de día, estrellas y luna de noche.
function Sky({ day }: { day: boolean }) {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 800" preserveAspectRatio="xMidYMin slice" pointerEvents="none">
      {day ? (
        <>
          <Circle cx={330} cy={150} r={34} fill="#FFE08A" />
          <Circle cx={330} cy={150} r={46} fill="#FFE08A" opacity={0.35} />
          {[
            [70, 220],
            [260, 420],
            [90, 600],
          ].map(([x, y], i) => (
            <Path key={i} d={`M${x} ${y} a18 18 0 0 1 34 -6 a14 14 0 0 1 24 10 a10 10 0 0 1 -2 20 h-52 a12 12 0 0 1 -4 -24z`} fill="#FFFFFF" opacity={0.9} />
          ))}
        </>
      ) : (
        <>
          <Circle cx={330} cy={150} r={26} fill="#F3EFD9" />
          <Circle cx={342} cy={142} r={24} fill="#1F2A3A" />
          {Array.from({ length: 40 }, (_, i) => (
            <Circle key={i} cx={(i * 97) % 390} cy={(i * 61) % 800} r={i % 3 === 0 ? 1.8 : 1.1} fill="#FFFFFF" opacity={0.7} />
          ))}
          <Circle cx={60} cy={380} r={70} fill="#4B3A78" opacity={0.35} />
          <Circle cx={340} cy={640} r={90} fill="#4B3A78" opacity={0.3} />
        </>
      )}
    </Svg>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontWeight: '700', fontSize: 26 },
  sub: { fontFamily: fonts.body, fontSize: 14 },
  progress: { borderRadius: radius.lg, padding: 14, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progLabel: { fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 15 },
  progNum: { fontFamily: fonts.display, fontWeight: '700', fontSize: 18 },
  island: { width: 180, alignItems: 'center', gap: 4 },
  plate: { marginTop: -10, backgroundColor: '#4B3A78', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, maxWidth: 176 },
  plateText: { color: '#FFFFFF', fontFamily: fonts.display, fontWeight: '700', fontSize: 15 },
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 12 },
});
