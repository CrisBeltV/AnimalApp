import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader, Button, Card, EntryRow, T, when } from '../components/ui';
import { MISSION_XP, activityWord, goalText, minutesOn, missionGoal, startOfDay, walkGoals, walkXp } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';

// Resumen del paseo que acaba de terminar, o de los paseos recientes.
export default function Resumen() {
  const { min, id, elegir } = useLocalSearchParams<{ min?: string; id?: string; elegir?: string }>();
  const { data } = useStore();
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const minutes = min ? Number(min) : null;
  const goal = missionGoal(pet.species);
  const today = minutesOn(data.entries, startOfDay(Date.now()));
  const walks = data.entries.filter((e) => e.kind === 'paseo');
  const past = elegir ? walkGoals(data).slice(0, 8) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader
        title={minutes !== null ? `¡Gran ${word.toLowerCase()}!` : `Resumen de ${word === 'Juego' ? 'juegos' : 'paseos'}`}
        subtitle={minutes !== null ? `${pet.name} y tú · hoy` : undefined}
        onBack={() => router.dismissTo('/')}
      />
      <ScrollView contentContainerStyle={s.page}>
        {elegir ? (
          <Card style={{ gap: 6, borderWidth: 2, borderColor: colors.blueOutline }}>
            <T.Black>Elige un {word.toLowerCase()} ya registrado</T.Black>
            <T.Muted style={{ fontSize: 13 }}>Se usa su mismo objetivo: tipo, tiempo, distancia y parque.</T.Muted>
            {past.length === 0 ? <T.Muted>Todavía no hay {word === 'Juego' ? 'juegos' : 'paseos'} registrados.</T.Muted> : null}
            {past.map((g) => (
              <Pressable
                key={g.key}
                accessibilityLabel={`Repetir ${g.name}`}
                onPress={() => router.replace({ pathname: '/paseo', params: { meta: g.key } })}
                style={s.pick}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <T.Black>{g.name}</T.Black>
                  <T.Muted style={{ fontSize: 13 }}>
                    {g.name !== goalText(g.goal, data.parks) ? `${goalText(g.goal, data.parks)} · ` : ''}
                    {g.count} {g.count === 1 ? 'vez' : 'veces'} · último {when(g.last)}
                  </T.Muted>
                </View>
                <T.Black style={{ fontSize: 14, color: colors.accent }}>Repetir</T.Black>
              </Pressable>
            ))}
            <Button label={`Mejor uno nuevo`} kind="secondary" onPress={() => router.replace('/paseo')} />
          </Card>
        ) : null}
        {minutes !== null && (
          <Card style={s.result}>
            <View style={s.stat}>
              <Text style={s.big}>{minutes} min</Text>
              <T.Eyebrow>TIEMPO</T.Eyebrow>
            </View>
            <View style={s.stat}>
              <Text style={[s.big, { color: colors.accent }]}>+{walkXp(minutes)}</Text>
              <T.Eyebrow>XP</T.Eyebrow>
            </View>
          </Card>
        )}
        {id && data.entries.some((e) => e.id === id) && (
          <Button
            label="Añadir parque, tipo y quién lo llevó"
            onPress={() => router.push({ pathname: '/salida', params: { id } })}
          />
        )}
        <Card style={{ gap: 4, backgroundColor: today >= goal ? colors.blue : colors.card }}>
          <T.Black>{today >= goal ? 'Misión del día completada' : 'Misión del día'}</T.Black>
          <T.Muted>
            {word === 'Juego' ? 'Juega' : 'Pasea'} {goal} min con {pet.name} · +{MISSION_XP} XP · llevas {Math.round(today)} min
          </T.Muted>
        </Card>
        <Card>
          <T.Black style={{ marginBottom: 4 }}>Últimos {word === 'Juego' ? 'juegos' : 'paseos'}</T.Black>
          {walks.length === 0 ? (
            <T.Muted>Todavía no hay registros.</T.Muted>
          ) : (
            walks.slice(0, 10).map((e) => <EntryRow key={e.id} entry={e} species={pet.species} />)
          )}
        </Card>
        <Button label="Listo" kind="solid" onPress={() => router.dismissTo('/')} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  result: { flexDirection: 'row', justifyContent: 'space-around' },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grey },
  stat: { alignItems: 'center' },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 34, color: colors.text },
});
