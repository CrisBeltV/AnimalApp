import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountButton } from '../../components/AccountButton';
import { BarrioMap } from '../../components/BarrioMap';
import { Icon } from '../../components/Icon';
import { PetDrawing } from '../../components/PetDrawing';
import { Bar, MenuRow, T, soon } from '../../components/ui';
import {
  MISSION_XP,
  activityWord,
  computeStats,
  minutesOn,
  missionGoal,
  mood,
  startOfDay,
  todayEntries,
  waterGoal,
} from '../../lib/game';
import { clock } from '../../lib/format';
import { useStore } from '../../lib/store';
import { colors, fonts, shadow, softShadow } from '../../lib/theme';
import { useNow } from '../../lib/useNow';

// INICIO = Paseo, el corazón de la app: el barrio como mapa de juego con tu mascota en el centro.
export default function Inicio() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const walking = data.activeWalkStart !== null;
  const now = useNow(walking ? 1000 : 30000);
  const [menu, setMenu] = useState(false);
  const [missions, setMissions] = useState(false);
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const petMood = mood(computeStats(data, now));

  const goal = missionGoal(pet.species);
  const today = minutesOn(data.entries, startOfDay(now));
  const done = today >= goal;

  const meals = todayEntries(data.entries, now, 'comida').length;
  const mealGoal = Math.max(1, data.settings.mealTimes.length);
  const water = todayEntries(data.entries, now, 'agua').reduce((sum, e) => sum + (e.ml ?? 0), 0);
  const water100 = waterGoal(data);
  const list = [
    {
      title: done ? `¡Misión cumplida con ${pet.name}!` : `${word === 'Juego' ? 'Juega' : 'Pasea'} ${goal} min con ${pet.name}`,
      value: today / goal,
      text: `${Math.min(Math.round(today), goal)}/${goal} min · +${MISSION_XP} XP`,
      go: '/paseos' as const,
    },
    { title: 'Anota sus comidas', value: meals / mealGoal, text: `${Math.min(meals, mealGoal)}/${mealGoal} comidas`, go: '/mascota' as const },
    { title: 'Que tome su agua', value: water / water100, text: `${water}/${water100} ml`, go: '/mascota' as const },
  ];
  const doneCount = list.filter((m) => m.value >= 1).length;

  const go = (path: '/paseos' | '/paseo' | '/explorar' | '/parques' | '/mascota') => () => {
    setMenu(false);
    setMissions(false);
    if (path === '/mascota') router.navigate(path);
    else router.push(path);
  };

  return (
    <View style={s.screen}>
      <BarrioMap
        initialWidth={700}
        controlsBottom={insets.bottom + 112}
        markers={[
          {
            id: 'parque', maxWidth: 1800,
            x: 230,
            y: -260,
            node: (
              <Pressable onPress={() => router.push('/parques')} style={s.pin}>
                <View style={[s.pinLabel, softShadow]}>
                  <T.Black style={s.pinText}>Parque nuevo · +30</T.Black>
                </View>
                <View style={[s.pinDot, { backgroundColor: colors.accent, width: 34, height: 34 }]}>
                  <Icon name="estrella" size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              </Pressable>
            ),
          },
          {
            id: 'perdido', maxWidth: 1800,
            x: -300,
            y: -120,
            node: (
              <Pressable onPress={() => router.push('/perdidas')} style={s.pin}>
                <View style={[s.pinLabel, softShadow]}>
                  <View style={[s.smallDot, { backgroundColor: colors.lost }]} />
                  <T.Black style={s.pinText}>Perdido · Rocky · 600 m</T.Black>
                </View>
                <View style={[s.pinDot, s.lostHalo, { backgroundColor: colors.lost, width: 40, height: 40 }]}>
                  <Icon name="huella" size={18} color="#FFFFFF" />
                </View>
              </Pressable>
            ),
          },
          {
            id: 'encontrado', maxWidth: 1800,
            x: 260,
            y: 330,
            node: (
              <Pressable onPress={() => router.push('/perdidas')} style={s.pin}>
                <View style={[s.pinLabel, softShadow]}>
                  <View style={[s.smallDot, { backgroundColor: colors.found }]} />
                  <T.Black style={s.pinText}>Encontrado · 1,1 km</T.Black>
                </View>
                <View style={[s.pinDot, { backgroundColor: colors.found, width: 36, height: 36 }]}>
                  <Icon name="huella" size={16} color="#FFFFFF" />
                </View>
              </Pressable>
            ),
          },
          {
            id: 'mascota',
            x: 0,
            y: 0,
            node: (
              <Pressable accessibilityLabel={`${pet.name}, tu mascota`} onPress={() => router.navigate('/mascota')} style={s.petSpot}>
                <View style={s.petShadow} />
                <PetDrawing species={pet.species} mood={petMood} size={96} />
                <View style={[s.petName, softShadow]}>
                  <T.Black style={{ fontSize: 13 }}>{pet.name}</T.Black>
                </View>
              </Pressable>
            ),
          },
        ]}
      />

      <View style={[s.topRow, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setMenu(true)}
          accessibilityRole="button"
          accessibilityState={{ expanded: menu }}
          style={[s.paseoBtn, softShadow]}
        >
          <T.Display style={{ fontSize: 28 }}>{word}</T.Display>
          <Icon name="chevronDown" size={22} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <AccountButton />
      </View>

      <Pressable
        accessibilityLabel="Misiones del día"
        onPress={() => setMissions(true)}
        style={[s.roundBtn, softShadow, { top: insets.top + 70 }]}
      >
        <Icon name="estrella" size={22} color={colors.accent} strokeWidth={2.4} />
        <View style={[s.badge, doneCount === list.length && { backgroundColor: colors.found }]}>
          <Text style={s.badgeText}>
            {doneCount}/{list.length}
          </Text>
        </View>
      </Pressable>

      {walking && (
        <Pressable onPress={() => router.push('/paseo')} style={[s.walkBanner, shadow, { top: insets.top + 70 }]}>
          <View style={s.liveDot} />
          <T.Black style={{ flex: 1, color: '#FFFFFF' }}>{word} en curso</T.Black>
          <Text style={s.walkClock}>{clock(now - data.activeWalkStart!)}</Text>
          <Icon name="chevronRight" size={18} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      )}

      <Pressable
        accessibilityLabel="Conquista de parques"
        onPress={() => router.push('/parques')}
        style={[s.roundBtn, softShadow, { top: insets.top + 126 }]}
      >
        <Icon name="bandera" size={22} color={colors.accent} strokeWidth={2.4} />
      </Pressable>

      <Text style={[s.exampleNote, { bottom: insets.bottom + 168 }]}>Mapa dibujado del barrio · pines de ejemplo · GPS muy pronto</Text>

      <Modal transparent visible={menu} animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable accessibilityLabel="Cerrar menú" style={s.backdrop} onPress={() => setMenu(false)} />
        <View style={[s.menu, shadow, { top: insets.top + 64 }]}>
          <MenuRow
            compact
            icon="reloj"
            title={walking ? `${word} en curso` : `Iniciar ${word.toLowerCase()} con ${pet.name}`}
            detail={walking ? `Llevas ${clock(now - data.activeWalkStart!)}` : 'Nuevo, recurrente o resumen'}
            onPress={go(walking ? '/paseo' : '/paseos')}
          />
          <MenuRow compact icon="mapa" title="Mapa de exploración" detail="Parques, tiendas, veterinarias…" onPress={go('/explorar')} />
          <MenuRow compact icon="bandera" tint="lilac" title="Parques" detail={`${data.parks.length} guardados · conquista`} onPress={go('/parques')} />
        </View>
      </Modal>

      <Modal transparent visible={missions} animationType="fade" onRequestClose={() => setMissions(false)}>
        <Pressable accessibilityLabel="Cerrar misiones" style={s.backdrop} onPress={() => setMissions(false)} />
        <View style={[s.missions, shadow, { top: insets.top + 64 }]}>
          <T.Eyebrow>MISIONES DEL DÍA</T.Eyebrow>
          {list.map((m) => (
            <Pressable key={m.title} onPress={go(m.go)} style={s.missionRow}>
              <T.Black style={{ fontSize: 15 }}>
                {m.value >= 1 ? '✅ ' : ''}
                {m.title}
              </T.Black>
              <View style={s.missionBar}>
                <Bar value={m.value * 100} color={m.value >= 1 ? colors.found : colors.accent} />
                <T.Black style={{ fontSize: 13 }}>{m.text}</T.Black>
              </View>
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.grass, overflow: 'hidden' },
  topRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paseoBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 14,
  },
  missions: {
    position: 'absolute',
    right: 16,
    width: 300,
    maxWidth: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  missionRow: { gap: 4 },
  missionBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    position: 'absolute',
    bottom: -6,
    right: -8,
    minWidth: 26,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.lilacStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', fontFamily: fonts.bodyBlack },
  walkBanner: {
    position: 'absolute',
    left: 16,
    right: 76,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#9EE6A8' },
  walkClock: { color: '#FFFFFF', fontFamily: fonts.display, fontWeight: '700', fontSize: 20 },
  roundBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: { alignItems: 'center', gap: 4 },
  pinLabel: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinText: { fontSize: 12 },
  smallDot: { width: 8, height: 8, borderRadius: 4 },
  pinDot: { borderRadius: 999, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  lostHalo: {
    shadowColor: colors.lost,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  petSpot: { width: 112, alignItems: 'center', marginTop: 40 },
  petShadow: {
    position: 'absolute',
    top: 82,
    width: 72,
    height: 16,
    borderRadius: 36,
    backgroundColor: '#1F2A3A',
    opacity: 0.22,
  },
  petName: {
    marginTop: 6,
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  exampleNote: {
    position: 'absolute',
    left: 16,
    right: 76,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    fontSize: 11,
    color: '#2E6B3F',
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  menu: {
    position: 'absolute',
    left: 16,
    width: 290,
    maxWidth: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
  },
  group: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 2 },
});
