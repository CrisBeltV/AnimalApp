import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Button, Card, T, soon } from '../components/ui';
import { HELPERS_YEAR, REUNIONS_YEAR, REUNITED } from '../lib/reports';
import { STORIES } from '../lib/samples';
import { useStore } from '../lib/store';
import { colors, fonts, softShadow } from '../lib/theme';

const ALLIES = [
  { icon: '🩺', name: 'Veterinaria aliada', detail: '10 % en consulta desde nivel 5' },
  { icon: '🛍️', name: 'Tienda de mascotas', detail: 'Canjea tus monedas por concentrado' },
  { icon: '🏠', name: 'Fundación rescatista', detail: 'Recibe emergencias y hogares temporales' },
];

const FAQ = [
  {
    q: '¿Qué hago si mi mascota se pierde?',
    a: 'Publica la alerta enseguida con fotos recientes. Avisamos a los vecinos a 2 km y cuando alguien la vea te llega un aviso con el lugar en el mapa.',
  },
  {
    q: '¿Mi número o dirección se ven?',
    a: 'No. Los vecinos te escriben por el chat de la app y en el mapa solo se ve un punto aproximado.',
  },
  {
    q: '¿Cómo funciona el reconocimiento por foto?',
    a: 'Cuando alguien toma la foto de una mascota suelta, la app compara la cara y la nariz con las fotos de los reportes cercanos y avisa si se parece.',
  },
  { q: '¿Cuánto cuesta reportar?', a: 'Nada. Reportar, buscar y adoptar en Animaapp es gratis.' },
];

// Reencuentros: familias reunidas, historias del barrio, aliados y preguntas frecuentes.
export default function Reencuentros() {
  const { data } = useStore();
  const [open, setOpen] = useState<number | null>(0);
  const mine = data.reports.filter((r) => r.closed).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Reencuentros" />
      <ScrollView contentContainerStyle={s.page}>
        <View style={[s.hero, softShadow]}>
          <Text style={s.big}>{REUNIONS_YEAR + mine}</Text>
          <T.Black style={{ textAlign: 'center' }}>familias reunidas en Engativá este año</T.Black>
          <T.Muted style={{ textAlign: 'center', fontSize: 13 }}>Gracias a {HELPERS_YEAR} vecinos que compartieron alertas</T.Muted>
        </View>

        <T.Black style={{ fontSize: 18 }}>Historias del barrio</T.Black>
        {STORIES.map((st) => (
          <Card key={st.pet} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={s.storyPet}>
              <PetDrawing species={st.species} mood="feliz" size={60} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={[s.badge, { backgroundColor: REUNITED.bg }]}>
                <Text style={[s.badgeText, { color: REUNITED.text }]}>REENCONTRADO</Text>
              </View>
              <T.Black>{st.title}</T.Black>
              <T.Body style={{ fontSize: 14, fontStyle: 'italic' }}>“{st.quote}”</T.Body>
              <T.Muted style={{ fontSize: 12 }}>{st.by}</T.Muted>
            </View>
          </Card>
        ))}
        <Button label="Contar mi historia" onPress={() => soon('Contar mi historia', 'Podrás contar cómo volvió tu mascota, con fotos, para animar a otros vecinos. Llega con la nube.')} />

        <T.Black style={{ fontSize: 18 }}>Aliados del barrio</T.Black>
        <Card style={{ gap: 4, paddingVertical: 8 }}>
          {ALLIES.map((a) => (
            <View key={a.name} style={s.ally}>
              <View style={s.allyIcon}>
                <Text style={{ fontSize: 20 }}>{a.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <T.Black style={{ fontSize: 15 }}>{a.name}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>{a.detail}</T.Muted>
              </View>
            </View>
          ))}
        </Card>

        <T.Black style={{ fontSize: 18 }}>Preguntas frecuentes</T.Black>
        <Card style={{ gap: 2, paddingVertical: 6 }}>
          {FAQ.map((f, i) => (
            <View key={f.q} style={[s.faq, i > 0 && { borderTopWidth: 1, borderTopColor: colors.grey }]}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === i }} onPress={() => setOpen(open === i ? null : i)} style={s.faqQ}>
                <T.Black style={{ flex: 1, fontSize: 15 }}>{f.q}</T.Black>
                <T.Black style={{ color: colors.textMuted }}>{open === i ? '−' : '+'}</T.Black>
              </Pressable>
              {open === i ? <T.Body style={{ fontSize: 14, paddingBottom: 10 }}>{f.a}</T.Body> : null}
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  hero: { backgroundColor: colors.foundSoft, borderRadius: 24, padding: 18, alignItems: 'center', gap: 4 },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 52, color: colors.foundText },
  storyPet: { width: 70, height: 70, borderRadius: 18, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  badge: { height: 20, paddingHorizontal: 7, borderRadius: 10, justifyContent: 'center', alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, letterSpacing: 0.4, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  ally: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  allyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lilacSoft, alignItems: 'center', justifyContent: 'center' },
  faq: { paddingVertical: 2 },
  faqQ: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
});
