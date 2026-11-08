import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { PetDrawing } from '../components/PetDrawing';
import { Button, T } from '../components/ui';
import { colors, shadow } from '../lib/theme';

const POINTS: { icon: IconName; title: string; text: string; bg: string; fg: string }[] = [
  { icon: 'salud', title: 'Su salud al día', text: 'Medicinas, citas y exámenes en un solo lugar', bg: colors.blue, fg: colors.body },
  { icon: 'bandera', title: 'Conquista tu barrio', text: 'Cada paseo suma minutos en los parques', bg: colors.accent, fg: '#FFFFFF' },
  { icon: 'estrella', title: 'Gana con constancia', text: 'XP, monedas y rachas por cuidarlo bien', bg: colors.lilac, fg: colors.body },
];

// Primera ventana de la app: qué es Animaapp y la entrada a la cuenta.
export default function Bienvenida() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[s.sky, { paddingTop: insets.top + 40 }]}>
        <T.Display style={{ fontSize: 34, textAlign: 'center' }}>Animaapp</T.Display>
        <T.Black style={{ textAlign: 'center' }}>El juego de cuidar a tu mascota</T.Black>
        <View style={s.pets}>
          <PetDrawing species="perro" mood="feliz" size={110} />
          <PetDrawing species="gato" mood="feliz" size={80} />
        </View>
        <View style={s.island} />
      </View>
      <View style={s.page}>
        <View style={[s.card, shadow]}>
          <T.Display style={{ fontSize: 24 }}>Cuida, explora y gana</T.Display>
          {POINTS.map((p) => (
            <View key={p.title} style={s.point}>
              <View style={[s.dot, { backgroundColor: p.bg }]}>
                <Icon name={p.icon} size={20} color={p.fg} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <T.Black style={{ fontSize: 15 }}>{p.title}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>{p.text}</T.Muted>
              </View>
            </View>
          ))}
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/entrar')} style={s.link}>
          <T.Black style={{ color: colors.accent }}>Ya tengo cuenta · Entrar</T.Black>
        </Pressable>
        <Button label="Empezar" kind="solid" onPress={() => router.push({ pathname: '/entrar', params: { modo: 'crear' } })} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  sky: { backgroundColor: colors.blueTint, alignItems: 'center', gap: 4, paddingBottom: 56 },
  pets: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 28, zIndex: 1 },
  island: { position: 'absolute', bottom: 34, width: 220, height: 54, borderRadius: 110, backgroundColor: '#B7E4C7' },
  page: { paddingHorizontal: 16, gap: 10, marginTop: -28, width: '100%', maxWidth: 480, alignSelf: 'center' },
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 18, gap: 12 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
