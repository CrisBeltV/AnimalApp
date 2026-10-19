import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader, T } from '../components/ui';
import { KINDS } from '../lib/reports';
import type { Kind } from '../lib/reports';
import { colors, softShadow } from '../lib/theme';

const OPTIONS: { kind: Kind; title: string; detail: string; go: () => void }[] = [
  {
    kind: 'perdida',
    title: 'Se perdió mi mascota',
    detail: 'Alerta con sus fotos y dónde la viste por última vez',
    go: () => router.push({ pathname: '/reportar', params: { tipo: 'perdida' } }),
  },
  {
    kind: 'visto',
    title: 'Vi una mascota suelta',
    detail: 'Tómale una foto y la app busca si alguien la está buscando',
    go: () => router.push({ pathname: '/reportar', params: { tipo: 'visto' } }),
  },
  {
    kind: 'emergencia',
    title: 'Emergencia',
    detail: 'Herida, atropellada o en peligro. Avisamos a veterinarias 24 h',
    go: () => router.push('/emergencia'),
  },
  {
    kind: 'adopcion',
    title: 'Dar en adopción',
    detail: 'Busca una familia responsable, sin costo',
    go: () => router.push({ pathname: '/adopcion', params: { tipo: 'adopcion' } }),
  },
  {
    kind: 'hogar',
    title: 'Busco hogar temporal',
    detail: 'Un lugar seguro mientras aparece su familia o un adoptante',
    go: () => router.push({ pathname: '/adopcion', params: { tipo: 'hogar' } }),
  },
];

// "¿Qué quieres reportar hoy?": las cinco clases de reporte.
export default function NuevoReporte() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Nueva alerta" />
      <ScrollView contentContainerStyle={s.page}>
        <T.Display style={{ fontSize: 26 }}>¿Qué quieres reportar hoy?</T.Display>
        <T.Muted>Tu reporte llega al instante a los vecinos a 2 km</T.Muted>
        {OPTIONS.map((o) => {
          const c = KINDS[o.kind];
          return (
            <Pressable key={o.kind} accessibilityRole="button" accessibilityLabel={o.title} onPress={o.go} style={[s.option, softShadow, { borderColor: c.bg }]}>
              <View style={[s.icon, { backgroundColor: c.bg }]}>
                <Text style={{ fontSize: 24 }}>{c.icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T.Black style={{ fontSize: 17, color: c.text }}>{o.title}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>{o.detail}</T.Muted>
              </View>
              <Text style={{ fontSize: 22, color: colors.textMuted }}>›</Text>
            </Pressable>
          );
        })}
        <T.Muted style={{ fontSize: 13, textAlign: 'center' }}>
          Tu número nunca se muestra: te escriben por el chat de la app. Los reportes falsos se pueden denunciar.
        </T.Muted>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  option: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  icon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
