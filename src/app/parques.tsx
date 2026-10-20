import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle } from 'react-native-svg';

import { BarrioMap } from '../components/BarrioMap';
import { Icon } from '../components/Icon';
import { Bar, Button, T } from '../components/ui';
import { allParks, conquestHint, CONQUER_MIN, STATUS, ZONE_RADIUS } from '../lib/parks';
import type { ParkInfo } from '../lib/parks';
import { distanceText } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, radius, shadow, softShadow } from '../lib/theme';

// Conquista de parques: el mapa de tu zona con cada parque pintado según de quién es este mes.
// Solo se entra desde la bandera de Inicio.
export default function Parques() {
  const { data, savePark } = useStore();
  const insets = useSafeAreaInsets();
  const pet = data.pet!;
  const [now] = useState(() => Date.now());
  const parks = allParks(data, now);
  const [selected, setSelected] = useState<string | null>(parks[0]?.park.id ?? null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [barrio, setBarrio] = useState('');
  const current = parks.find((p) => p.park.id === selected);
  const mine = parks.filter((p) => p.status === 'mio').length;

  const add = () => {
    const id = savePark({ name: name.trim(), barrio: barrio.trim() || undefined });
    setAdding(false);
    setName('');
    setBarrio('');
    setSelected(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.grass }}>
      <BarrioMap
        initialWidth={2400}
        focusY={0.36}
        controlsBottom={(current ? 330 : 150) + insets.bottom}
        overlay={<Circle cx={0} cy={0} r={ZONE_RADIUS} fill={colors.accent} fillOpacity={0.05} stroke={colors.accent} strokeWidth={8} strokeDasharray="40 30" />}
        markers={[
          {
            id: 'tu',
            x: 0,
            y: 0,
            node: (
              <View style={{ alignItems: 'center' }}>
                <View style={s.me} />
                <View style={[s.meLabel, softShadow]}>
                  <Text style={s.meText}>{pet.name}</Text>
                </View>
              </View>
            ),
          },
          ...parks.map((p) => ({
            id: p.park.id,
            ...p.spot,
            node: <Zone info={p} selected={p.park.id === selected} onPress={() => setSelected(p.park.id)} />,
          })),
        ]}
      />

      <View style={[s.top, shadow, { top: insets.top + 10 }]}>
        <Pressable accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.back}>
          <Icon name="atras" size={22} strokeWidth={2.4} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <T.Display style={{ fontSize: 19 }}>Conquista de parques</T.Display>
          <T.Muted style={{ fontSize: 12 }}>Tu zona · 1 km a la redonda</T.Muted>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Ver todos los parques" onPress={() => router.push('/lugares')} style={s.all}>
          <Text style={s.allNum}>
            {mine}/{parks.length}
          </Text>
          <Text style={s.allText}>VER TODOS</Text>
        </Pressable>
      </View>

      <View style={[s.sheet, shadow, { paddingBottom: insets.bottom + 14 }]}>
        <View style={s.handle} />
        {current ? (
          <ParkSheet info={current} onFicha={() => router.push({ pathname: '/parque', params: { id: current.park.id } })} />
        ) : (
          <T.Body>Añade los parques donde paseas con {pet.name}. Cada uno es una zona por conquistar.</T.Body>
        )}
        <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={s.addRow}>
          <Text style={s.addPlus}>＋</Text>
          <T.Black style={{ color: colors.accent }}>Añadir un parque</T.Black>
        </Pressable>
      </View>

      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <View style={s.backdrop}>
          <View style={s.modal}>
            <T.Display style={{ fontSize: 20 }}>Parque nuevo</T.Display>
            <TextInput value={name} onChangeText={setName} placeholder="Nombre del parque" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Nombre del parque" />
            <TextInput value={barrio} onChangeText={setBarrio} placeholder="Barrio (opcional)" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Barrio" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Button label="Guardar" kind="solid" style={{ flex: 1 }} disabled={!name.trim()} onPress={add} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Zone({ info, selected, onPress }: { info: ParkInfo; selected: boolean; onPress: () => void }) {
  const st = STATUS[info.status];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${info.park.name}, ${st.label}`} onPress={onPress} style={{ alignItems: 'center' }}>
      <View
        style={[
          s.zone,
          { backgroundColor: st.fill, borderColor: st.stroke, borderStyle: st.dashed ? 'dashed' : 'solid' },
          selected && { borderWidth: 4, transform: [{ scale: 1.08 }] },
        ]}
      >
        <View style={[s.flag, softShadow, { backgroundColor: info.status === 'mio' ? colors.accent : '#FFFFFF' }]}>
          <Text style={{ fontSize: 16 }}>{info.status === 'mio' ? '🏁' : '🚩'}</Text>
        </View>
      </View>
      <View style={[s.pill, softShadow]}>
        <Text style={s.pillText} numberOfLines={1}>
          {info.park.name}
        </Text>
      </View>
    </Pressable>
  );
}

function ParkSheet({ info, onFicha }: { info: ParkInfo; onFicha: () => void }) {
  const st = STATUS[info.status];
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver ficha de ${info.park.name}`} onPress={onFicha} style={s.sheetHead}>
        <View style={{ flex: 1 }}>
          <T.Display style={{ fontSize: 22 }} numberOfLines={1}>
            {info.park.name}
          </T.Display>
          <T.Muted style={{ fontSize: 13 }}>{[`A ${distanceText(info.distance)}`, info.park.barrio].filter(Boolean).join(' · ')}</T.Muted>
        </View>
        <OwnerPill status={info.status} />
        <Text style={{ fontSize: 22, color: colors.textMuted }}>›</Text>
      </Pressable>
      <View style={{ gap: 6 }}>
        <View style={s.row}>
          <T.Black style={{ fontSize: 14 }}>Conquista</T.Black>
          <T.Black style={{ fontSize: 14, color: st.text }}>{info.pct} %</T.Black>
        </View>
        <Bar value={info.pct} color={colors.accent} />
        <T.Muted style={{ fontSize: 13 }}>{conquestHint(info)}</T.Muted>
      </View>
      <Tiles info={info} />
      <Button
        label={info.status === 'mio' ? 'Pasear aquí' : 'Ir a conquistarlo'}
        kind="solid"
        onPress={() => router.push({ pathname: '/paseo', params: { parque: info.park.id } })}
      />
    </>
  );
}

export function OwnerPill({ status }: { status: ParkInfo['status'] }) {
  const st = STATUS[status];
  return (
    <View style={[s.owner, { borderColor: status === 'libre' ? colors.grey : colors.blueOutline, backgroundColor: status === 'mio' ? colors.accent : colors.blue }]}>
      <Text style={[s.ownerText, { color: status === 'mio' ? '#FFFFFF' : st.text }]}>{st.label}</Text>
    </View>
  );
}

export function Tiles({ info, bg = colors.bg }: { info: ParkInfo; bg?: string }) {
  const tile = [s.tile, { backgroundColor: bg }];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={tile}>
        <Text style={s.tileLabel}>TIEMPO AQUÍ</Text>
        <Text style={s.tileValue}>{info.month} min</Text>
        <Text style={s.tileSub}>este mes · meta {CONQUER_MIN}</Text>
      </View>
      <View style={tile}>
        <Text style={s.tileLabel}>AIRE</Text>
        <Text style={s.tileValue}>—</Text>
        <Text style={s.tileSub}>Muy pronto</Text>
      </View>
      <View style={tile}>
        <Text style={s.tileLabel}>CLIMA</Text>
        <Text style={s.tileValue}>—</Text>
        <Text style={s.tileSub}>Muy pronto</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  top: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    maxWidth: 560,
    alignSelf: 'center',
  },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  all: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: colors.blue },
  allNum: { fontFamily: fonts.display, fontWeight: '700', fontSize: 18, color: colors.accent },
  allText: { fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 10, color: colors.accent, letterSpacing: 0.5 },
  me: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, borderWidth: 4, borderColor: '#FFFFFF' },
  meLabel: { marginTop: 4, paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  meText: { fontSize: 11, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.accent },
  zone: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  flag: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pill: { marginTop: 4, paddingHorizontal: 10, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', maxWidth: 150 },
  pillText: { fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.text },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.grey },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  owner: { paddingHorizontal: 10, height: 26, borderRadius: 13, borderWidth: 1.5, justifyContent: 'center' },
  ownerText: { fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  tile: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: 10, gap: 2 },
  tileLabel: { fontSize: 10, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  tileValue: { fontFamily: fonts.display, fontWeight: '700', fontSize: 20, color: colors.text },
  tileSub: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  addPlus: { fontSize: 18, color: colors.accent, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: radius.xl, padding: 18, gap: 10 },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.grey,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.body,
  },
});
