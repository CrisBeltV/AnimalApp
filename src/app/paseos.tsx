import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { BackHeader, T } from '../components/ui';
import { RECURRENT_TIMES, activityWord, minutesOn, recurrentWalks, startOfDay } from '../lib/game';
import { clock } from '../lib/format';
import { useStore } from '../lib/store';
import { colors, shadow } from '../lib/theme';
import { useNow } from '../lib/useNow';

// Paseo con la mascota: tres opciones iguales, cada una abre su propia ventana.
export default function Paseos() {
  const { data } = useStore();
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const plural = word === 'Juego' ? 'juegos' : 'paseos';
  const walking = data.activeWalkStart !== null;
  const now = useNow(walking ? 1000 : 30000);
  const recurrent = recurrentWalks(data);
  const today = minutesOn(data.entries, startOfDay(now));

  const options: { icon: IconName; title: string; detail: string; onPress: () => void }[] = [
    {
      icon: 'reloj',
      title: walking ? `${word} en curso` : `Iniciar nuevo ${word.toLowerCase()}`,
      detail: walking ? `Llevas ${clock(now - data.activeWalkStart!)}` : 'Elige tu objetivo y sal',
      onPress: () => router.push('/paseo'),
    },
    {
      icon: 'estrella',
      title: `${word === 'Juego' ? 'Juegos' : 'Paseos'} recurrentes`,
      detail: recurrent.length ? `${recurrent.length} guardados` : `Los que repitas ${RECURRENT_TIMES} veces`,
      onPress: () => router.push('/recurrentes'),
    },
    {
      icon: 'lista',
      title: `Registro de ${plural}`,
      detail: `Hoy: ${Math.round(today)} min`,
      onPress: () => router.push('/resumen'),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={`${word} con ${pet.name}`} />
      <ScrollView contentContainerStyle={s.page}>
        {options.map((o) => (
          <Pressable key={o.icon} accessibilityRole="button" onPress={o.onPress} style={[s.option, shadow]}>
            <View style={s.icon}>
              <Icon name={o.icon} size={26} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T.Display style={{ fontSize: 19 }}>{o.title}</T.Display>
              <T.Muted style={{ fontSize: 13 }}>{o.detail}</T.Muted>
            </View>
            <Icon name="chevronRight" size={20} color={colors.textMuted} strokeWidth={2.4} />
          </Pressable>
        ))}
      </ScrollView>

    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  option: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
});
