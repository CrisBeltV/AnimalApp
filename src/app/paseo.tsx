import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Check, Chips, ParkPicker } from '../components/form';
import { GameMap } from '../components/GameMap';
import { PetDrawing } from '../components/PetDrawing';
import { Bar, Button, T } from '../components/ui';
import { MISSION_XP, NEW_PARK_XP, WALK_GOALS, WALK_TYPES, activityWord, computeStats, minutesOn, missionGoal, mood, parkStats, startOfDay } from '../lib/game';
import { clock } from '../lib/format';
import { useStore } from '../lib/store';
import { colors, fonts, shadow } from '../lib/theme';
import type { WalkGoal } from '../lib/types';
import { useNow } from '../lib/useNow';

const TIME_GOALS = [
  { id: '15', label: '15 min' },
  { id: '30', label: '30 min' },
  { id: '45', label: '45 min' },
  { id: '60', label: '1 hora' },
  { id: '0', label: 'Libre' },
];

const KM_GOALS = [
  { id: '1', label: '1 km' },
  { id: '2', label: '2 km' },
  { id: '3', label: '3 km' },
  { id: '0', label: 'Sin meta' },
];

// Paseo en tres pasos: elegir el objetivo, el cronómetro en vivo y el resumen al terminar.
export default function PaseoEnCurso() {
  const params = useLocalSearchParams<{ parque?: string }>();
  const { data, startWalk, finishWalk, cancelWalk } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow(1000);
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const start = data.activeWalkStart;
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [tipo, setTipo] = useState(pet.species === 'gato' ? 'juego' : 'paseo');
  const [time, setTime] = useState('30');
  const [km, setKm] = useState('0');
  const [park, setPark] = useState<string | undefined>(params.parque);
  const [explore, setExplore] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const begin = () => {
    const goal: WalkGoal = { tipo };
    if (Number(time) > 0) goal.minutes = Number(time);
    if (Number(km) > 0) goal.km = Number(km);
    if (park) goal.parqueId = park;
    if (explore) goal.explorar = true;
    startWalk(goal);
  };

  const finish = () => {
    const { id } = finishWalk();
    setSummaryId(id);
  };

  let panel: React.ReactNode;
  if (summaryId) {
    panel = <Summary id={summaryId} />;
  } else if (start) {
    const goal = data.walkGoal ?? { tipo: 'paseo' };
    const elapsed = now - start;
    const minutes = elapsed / 60000;
    const target = goal.minutes ?? WALK_GOALS.find((g) => g > minutes);
    const goalPark = data.parks.find((p) => p.id === goal.parqueId);
    panel = (
      <>
        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.big}>{clock(elapsed)}</Text>
            <T.Eyebrow>TIEMPO</T.Eyebrow>
          </View>
          <View style={s.stat}>
            <Text style={s.big}>+{Math.max(0, Math.floor(minutes))}</Text>
            <T.Eyebrow>PUNTOS</T.Eyebrow>
          </View>
        </View>
        <T.Bold style={{ textAlign: 'center' }}>
          {target
            ? minutes >= target
              ? `¡Objetivo de ${target} min cumplido!`
              : `Objetivo: ${target} min · faltan ${Math.ceil(target - minutes)}`
            : '¡Cumpliste las 3 metas de hoy!'}
        </T.Bold>
        <Bar value={target ? (minutes / target) * 100 : 100} />
        {(goalPark || goal.km || goal.explorar) && (
          <View style={{ gap: 2 }}>
            {goalPark ? <T.Muted style={{ fontSize: 13 }}>🌳 Conquistando {goalPark.name}</T.Muted> : null}
            {goal.km ? <T.Muted style={{ fontSize: 13 }}>📏 Meta de {goal.km} km (la distancia se medirá con el GPS muy pronto)</T.Muted> : null}
            {goal.explorar ? <T.Muted style={{ fontSize: 13 }}>🧭 Exploración: visita un parque nuevo</T.Muted> : null}
          </View>
        )}
        <Button label={`Terminar ${word.toLowerCase()}`} kind="solid" onPress={finish} />
        <Button
          label="Cancelar"
          kind="secondary"
          onPress={() => {
            cancelWalk();
            back();
          }}
        />
      </>
    );
  } else {
    panel = (
      <>
        <T.Display style={{ fontSize: 24, textAlign: 'center' }}>Objetivo de hoy</T.Display>
        <T.Black>Actividad</T.Black>
        <Chips options={WALK_TYPES} value={tipo} onChange={setTipo} />
        <T.Black>Tiempo</T.Black>
        <Chips options={TIME_GOALS} value={time} onChange={setTime} />
        <T.Black>Distancia</T.Black>
        <Chips options={KM_GOALS} value={km} onChange={setKm} />
        {km !== '0' && <T.Muted style={{ fontSize: 12 }}>La distancia se medirá con el GPS del teléfono, muy pronto.</T.Muted>}
        <T.Black>Conquista: ¿en qué parque?</T.Black>
        <ParkPicker value={park} onChange={setPark} />
        <Check label="Exploración: visitar un parque nuevo" detail={`+${NEW_PARK_XP} XP al registrar un parque donde no hayan ido`} on={explore} onPress={() => setExplore(!explore)} />
        <Button label={`Empezar ${word.toLowerCase()} con ${pet.name}`} kind="solid" onPress={begin} />
        <Button label="Volver" kind="secondary" onPress={back} />
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.grass }}>
      <GameMap />
      <View style={s.petSpot}>
        <PetDrawing species={pet.species} mood={mood(computeStats(data, now))} size={120} />
      </View>
      <View style={[s.panel, shadow]}>
        <ScrollView contentContainerStyle={[s.panelInner, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
          {panel}
        </ScrollView>
      </View>
    </View>
  );
}

// Resumen del paseo dentro de la misma ventana.
function Summary({ id }: { id: string }) {
  const { data } = useStore();
  const pet = data.pet!;
  const entry = data.entries.find((e) => e.id === id);
  if (!entry) return <T.Muted>Guardando…</T.Muted>;
  const minutes = entry.minutes ?? 0;
  const goalMin = missionGoal(pet.species);
  const today = minutesOn(data.entries, startOfDay(entry.at));
  const park = data.parks.find((p) => p.id === entry.fields?.parqueId);
  const st = park ? parkStats(data.entries, park.id) : null;
  const newPark = st && st.visits.length === 1;
  const done = () => router.dismissTo('/');
  return (
    <>
      <T.Display style={{ fontSize: 26, textAlign: 'center' }}>¡Gran {activityWord(pet.species).toLowerCase()}!</T.Display>
      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.big}>{minutes} min</Text>
          <T.Eyebrow>TIEMPO</T.Eyebrow>
        </View>
        <View style={s.stat}>
          <Text style={[s.big, { color: colors.accent }]}>+{entry.xp}</Text>
          <T.Eyebrow>XP</T.Eyebrow>
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <T.Bold>{today >= goalMin ? `✅ Misión del día cumplida (+${MISSION_XP} XP)` : `Misión del día: ${Math.round(today)} de ${goalMin} min`}</T.Bold>
        {st && park ? (
          <T.Bold>
            🌳 {park.name}: {st.minutes} min{st.badge ? ` · ${st.badge.icon} ${st.badge.label}` : ''}
            {st.next ? ` · faltan ${st.next.min - st.minutes} min para ${st.next.label}` : ''}
          </T.Bold>
        ) : (
          <T.Muted>Añade el parque para sumar minutos a su conquista.</T.Muted>
        )}
        {newPark ? <T.Bold>🧭 ¡Parque nuevo! +{NEW_PARK_XP} XP</T.Bold> : null}
      </View>
      <Button label="Añadir parque, tipo o nota" onPress={() => router.push({ pathname: '/salida', params: { id } })} />
      <Button label="Listo" kind="solid" onPress={done} />
    </>
  );
}

const s = StyleSheet.create({
  petSpot: { position: 'absolute', left: '50%', top: '14%', marginLeft: -60 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '78%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  panelInner: { paddingTop: 20, paddingHorizontal: 20, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 40, color: colors.text },
});
