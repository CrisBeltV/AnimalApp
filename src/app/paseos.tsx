import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { BackHeader, Button, T } from '../components/ui';
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
  const [ask, setAsk] = useState(false);

  const options: { icon: IconName; title: string; detail: string; onPress: () => void }[] = [
    {
      icon: 'reloj',
      title: walking ? `${word} en curso` : `Iniciar nuevo ${word.toLowerCase()}`,
      detail: walking ? `Llevas ${clock(now - data.activeWalkStart!)}` : 'Elige tu objetivo y sal',
      onPress: () => (walking ? router.push('/paseo') : setAsk(true)),
    },
    {
      icon: 'estrella',
      title: `${word === 'Juego' ? 'Juegos' : 'Paseos'} recurrentes`,
      detail: recurrent.length ? `${recurrent.length} guardados` : `Los que repitas ${RECURRENT_TIMES} veces`,
      onPress: () => router.push('/recurrentes'),
    },
    {
      icon: 'lista',
      title: `Resumen de ${plural}`,
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

      <Modal transparent visible={ask} animationType="fade" onRequestClose={() => setAsk(false)}>
        <Pressable accessibilityLabel="Cerrar pregunta" style={s.backdrop} onPress={() => setAsk(false)} />
        <View style={[s.sheet, shadow]}>
          <T.Display style={{ fontSize: 20, textAlign: 'center' }}>¿Quieres seleccionar un {word.toLowerCase()} ya registrado?</T.Display>
          <T.Muted style={{ textAlign: 'center', fontSize: 13 }}>Puedes repetir el objetivo de uno que ya hicieron.</T.Muted>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="No"
              kind="secondary"
              style={{ flex: 1 }}
              onPress={() => {
                setAsk(false);
                router.push('/paseo');
              }}
            />
            <Button
              label="Sí"
              kind="solid"
              style={{ flex: 1 }}
              onPress={() => {
                setAsk(false);
                router.push({ pathname: '/resumen', params: { elegir: '1' } });
              }}
            />
          </View>
        </View>
      </Modal>
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
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  sheet: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: 340,
    maxWidth: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
});
