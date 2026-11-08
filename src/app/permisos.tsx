import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { BackHeader, Button, T } from '../components/ui';
import { askNotify } from '../lib/notify';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';
import { Text } from '../components/Text';

type Step = { id: string; icon: IconName; name: string; why: string; title: string; reason: string; color: string; cta: string; ask: () => Promise<boolean> };

const STEPS: Step[] = [
  {
    id: 'ubicacion',
    icon: 'mapa',
    name: 'Ubicación',
    why: 'Para paseos y conquistas',
    title: 'Activa la ubicación',
    reason: 'La usaremos solo durante un paseo, para contar minutos en los parques. Tu casa nunca aparece en el mapa.',
    color: colors.accent,
    cta: 'Permitir ubicación',
    // El GPS llega en una próxima versión: por ahora solo se guarda la respuesta.
    ask: async () => true,
  },
  {
    id: 'avisos',
    icon: 'campana',
    name: 'Notificaciones',
    why: 'Para medicinas y citas',
    title: 'Activa los avisos',
    reason: 'Te avisamos la hora de cada dosis, cada cita y cada comida.',
    color: colors.blueOutline,
    cta: 'Permitir avisos',
    ask: askNotify,
  },
  {
    id: 'camara',
    icon: 'camara',
    name: 'Cámara',
    why: 'Para fotos y exámenes',
    title: 'Activa la cámara',
    reason: 'Para la foto de tu mascota, la foto de la semana y para subir el carnet o las fórmulas.',
    color: colors.lilac,
    cta: 'Permitir cámara',
    ask: async () => {
      try {
        return (await ImagePicker.requestCameraPermissionsAsync()).granted;
      } catch {
        return false;
      }
    },
  },
];

// Permisos en tres pasos, después de crear la cuenta. Cada uno se puede dejar para después.
export default function Permisos() {
  const { data } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'si' | 'no'>>({});
  const done = step >= STEPS.length;
  const cur = STEPS[Math.min(step, STEPS.length - 1)];

  const answer = async (yes: boolean) => {
    const ok = yes ? await cur.ask() : false;
    setAnswers((a) => ({ ...a, [cur.id]: yes && ok ? 'si' : 'no' }));
    setStep(step + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Permisos" subtitle={`Paso ${Math.min(step + 1, STEPS.length)} de ${STEPS.length}`} />
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.track}>
          <View style={[s.fill, { width: `${(Math.min(step + 1, STEPS.length) / STEPS.length) * 100}%` }]} />
        </View>
        <View style={[s.hero, { backgroundColor: done ? colors.accent : cur.color }]}>
          <Icon name={done ? 'estrella' : cur.icon} size={60} color="#FFFFFF" strokeWidth={2} />
        </View>
        <T.Display style={{ fontSize: 26, textAlign: 'center' }}>{done ? '¡Todo listo!' : cur.title}</T.Display>
        <T.Muted style={{ fontSize: 15, textAlign: 'center' }}>{done ? 'Puedes cambiar estos permisos cuando quieras en los ajustes del teléfono.' : cur.reason}</T.Muted>

        <View style={s.list}>
          {STEPS.map((p, i) => {
            const a = answers[p.id];
            const now = i === step;
            return (
              <View key={p.id} style={[s.row, i === STEPS.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.dot, a === 'si' ? { backgroundColor: colors.accent } : now ? { backgroundColor: p.color } : null]}>
                  <Text style={[s.dotText, (a === 'si' || now) && { color: '#FFFFFF' }]}>{a === 'si' ? '✓' : String(i + 1)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <T.Black style={{ fontSize: 15 }}>{p.name}</T.Black>
                  <T.Muted style={{ fontSize: 13 }}>{p.why}</T.Muted>
                </View>
                <T.Black style={{ fontSize: 12, color: colors.textMuted }}>{a === 'si' ? 'Activado' : a === 'no' ? 'Después' : now ? 'Ahora' : ''}</T.Black>
              </View>
            );
          })}
        </View>

        {done ? (
          <Button label={data.pet ? 'Ir a la app' : 'Elegir mi mascota'} kind="solid" onPress={() => router.replace(data.pet ? '/' : '/crear-mascota')} />
        ) : (
          <>
            <Button label={cur.cta} kind="solid" onPress={() => answer(true)} />
            <Pressable onPress={() => answer(false)} style={s.later}>
              <T.Black style={{ color: colors.textMuted }}>Ahora no</T.Black>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 480, alignSelf: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.grey, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.accent },
  hero: { alignSelf: 'center', width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginTop: 10, borderWidth: 10, borderColor: '#FFFFFF' },
  list: { backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, borderBottomWidth: 1, borderBottomColor: colors.grey },
  dot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.grey, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 14, color: colors.textMuted },
  later: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
