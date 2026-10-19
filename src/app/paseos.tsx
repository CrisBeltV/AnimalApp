import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader, Button, Card, MenuRow, T } from '../components/ui';
import { activityWord, goalText, minutesOn, startOfDay } from '../lib/game';
import { clock } from '../lib/format';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import { useNow } from '../lib/useNow';

// Iniciar paseo: uno nuevo, uno recurrente o ver el resumen.
export default function Paseos() {
  const { data, removeRoutine } = useStore();
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const plural = word === 'Juego' ? 'juegos' : 'paseos';
  const walking = data.activeWalkStart !== null;
  const now = useNow(walking ? 1000 : 30000);
  const routines = data.routines ?? [];
  const today = minutesOn(data.entries, startOfDay(now));
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={`${word} con ${pet.name}`} />
      <ScrollView contentContainerStyle={s.page}>
        {walking ? (
          <Button label={`${word} en curso · ${clock(now - data.activeWalkStart!)}`} kind="solid" onPress={() => router.push('/paseo')} />
        ) : (
          <Button label={`Iniciar nuevo ${word.toLowerCase()}`} kind="solid" onPress={() => router.push('/paseo')} />
        )}

        <Card style={{ gap: 6 }}>
          <T.Black>{word === 'Juego' ? 'Juegos recurrentes' : 'Paseos recurrentes'}</T.Black>
          {routines.length === 0 ? (
            <T.Muted style={{ fontSize: 13 }}>
              Cada objetivo nuevo que elijas (paseo, juego, entrenamiento) queda guardado aquí para repetirlo con un toque.
            </T.Muted>
          ) : (
            routines.map((r) => (
              <View key={r.id} style={s.row}>
                <Pressable
                  accessibilityLabel={`Usar ${r.name}`}
                  disabled={walking}
                  onPress={() => router.push({ pathname: '/paseo', params: { rutina: r.id } })}
                  style={{ flex: 1, gap: 2, opacity: walking ? 0.5 : 1 }}
                >
                  <T.Black>{r.name}</T.Black>
                  <T.Muted style={{ fontSize: 13 }}>{goalText(r, data.parks)}</T.Muted>
                </Pressable>
                {removing === r.id ? (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable onPress={() => setRemoving(null)} style={s.small}>
                      <T.Black style={{ fontSize: 13 }}>No</T.Black>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        removeRoutine(r.id);
                        setRemoving(null);
                      }}
                      style={[s.small, { backgroundColor: colors.lostSoft }]}
                    >
                      <T.Black style={{ fontSize: 13, color: colors.lostText }}>Quitar</T.Black>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable accessibilityLabel={`Quitar ${r.name}`} onPress={() => setRemoving(r.id)} style={s.small}>
                    <T.Black style={{ fontSize: 13, color: colors.textMuted }}>✕</T.Black>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </Card>

        <Card style={{ padding: 6 }}>
          <MenuRow
            compact
            icon="lista"
            title={`Resumen de ${plural}`}
            detail={`Hoy: ${Math.round(today)} min`}
            onPress={() => router.push('/resumen')}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grey },
  small: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.bg },
});
