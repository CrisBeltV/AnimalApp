import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader, Button, Card, T, when } from '../components/ui';
import { RECURRENT_TIMES, activityWord, goalText, recurrentWalks, walkGoals } from '../lib/game';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// Paseos recurrentes: los objetivos que ya hicieron 3 veces o más, listos para repetir.
export default function Recurrentes() {
  const { data, saveRoutine } = useStore();
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const walking = data.activeWalkStart !== null;
  const list = recurrentWalks(data);
  const almost = walkGoals(data).filter((g) => g.started > 0 && g.started < RECURRENT_TIMES && !g.hidden).slice(0, 3);
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={`${word === 'Juego' ? 'Juegos' : 'Paseos'} recurrentes`} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page}>
        <T.Muted>
          Cuando hacen {RECURRENT_TIMES} veces o más un {word.toLowerCase()} con el mismo objetivo (tipo, tiempo, distancia y parque), queda guardado aquí.
        </T.Muted>
        <Card style={{ gap: 6 }}>
          {list.length === 0 ? <T.Muted>Todavía no hay ninguno.</T.Muted> : null}
          {list.map((g) => (
            <View key={g.key} style={s.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <T.Black>{g.name}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>
                  {goalText(g.goal, data.parks)} · {g.started} veces · último {when(g.last)}
                </T.Muted>
              </View>
              {removing === g.key ? (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable onPress={() => setRemoving(null)} style={s.small}>
                    <T.Black style={{ fontSize: 13 }}>No</T.Black>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      saveRoutine({ ...g.goal, id: g.key, name: g.name, hidden: true });
                      setRemoving(null);
                    }}
                    style={[s.small, { backgroundColor: colors.lostSoft }]}
                  >
                    <T.Black style={{ fontSize: 13, color: colors.lostText }}>Quitar</T.Black>
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable
                    accessibilityLabel={`Usar ${g.name}`}
                    disabled={walking}
                    onPress={() => router.push({ pathname: '/paseo', params: { meta: g.key } })}
                    style={[s.small, { backgroundColor: colors.blue, opacity: walking ? 0.5 : 1 }]}
                  >
                    <T.Black style={{ fontSize: 13, color: colors.accent }}>Usar</T.Black>
                  </Pressable>
                  <Pressable accessibilityLabel={`Quitar ${g.name}`} onPress={() => setRemoving(g.key)} style={s.small}>
                    <T.Black style={{ fontSize: 13, color: colors.textMuted }}>✕</T.Black>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </Card>
        {almost.length > 0 && (
          <Card style={{ gap: 6 }}>
            <T.Black>Casi recurrentes</T.Black>
            {almost.map((g) => (
              <View key={g.key} style={s.row}>
                <View style={{ flex: 1 }}>
                  <T.Bold>{g.name}</T.Bold>
                  <T.Muted style={{ fontSize: 13 }}>
                    {g.started} de {RECURRENT_TIMES} veces
                  </T.Muted>
                </View>
              </View>
            ))}
          </Card>
        )}
        <Button label={`Iniciar nuevo ${word.toLowerCase()}`} kind="solid" disabled={walking} onPress={() => router.push('/paseo')} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grey },
  small: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.bg },
});
