import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountButton } from '../../components/AccountButton';
import { Icon } from '../../components/Icon';
import { Button, T, soon } from '../../components/ui';
import { ACHIEVEMENTS, weekMinutes } from '../../lib/game';
import { sampleReports } from '../../lib/samples';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../lib/theme';
import { useNow } from '../../lib/useNow';

export default function Comunidad() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const pet = data.pet!;
  const reports = [...data.reports, ...sampleReports(now)];
  const lost = reports.filter((r) => r.kind === 'perdida');
  const won = ACHIEVEMENTS.filter((a) => data.unlocked.includes(a.id)).length;
  const myWeek = Math.round(weekMinutes(data.entries, now).reduce((a, b) => a + b, 0));

  // Tabla de posiciones: tú con tus minutos reales, los vecinos son de ejemplo.
  const board = [
    { name: 'Luna', minutes: 280, color: colors.lilac, me: false },
    { name: `Tú y ${pet.name}`, minutes: myWeek, color: colors.accent, me: true },
    { name: 'Max', minutes: 240, color: '#C9DBEE', me: false },
  ];
  const ranked = [...board].sort((a, b) => b.minutes - a.minutes);
  const podium = [ranked[1], ranked[0], ranked[2]];
  const heights = [54, 76, 38];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[s.page, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <T.Display>Comunidad</T.Display>
        <AccountButton />
      </View>

      <Pressable onPress={() => router.push('/perdidas')} style={s.alertCard}>
        <View style={s.alertIcon}>
          <Icon name="alerta" size={20} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <View style={{ flex: 1 }}>
          <T.Black>Mascotas perdidas y encontradas</T.Black>
          <T.Muted>
            {reports.length} alertas a 2 km · {lost[0]?.petName} se perdió
          </T.Muted>
        </View>
        <Icon name="chevronRight" size={20} color={colors.textMuted} strokeWidth={2.2} />
      </Pressable>

      <View style={s.row}>
        <Button label="Reportar perdida" kind="lost" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/reportar', params: { tipo: 'perdida' } })} />
        <Button label="Encontré una" kind="found" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/reportar', params: { tipo: 'encontrada' } })} />
      </View>

      <View style={s.row}>
        <Pressable
          onPress={() => soon('Amigos', 'Conecta con otros dueños de Villa Luz, Los Álamos y Ciudadela Colsubsidio. Necesita cuentas en la nube.')}
          style={s.stat}
        >
          <T.Muted style={{ fontSize: 13 }}>Amigos</T.Muted>
          <Text style={s.statNum}>0</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/logros')} style={s.stat}>
          <T.Muted style={{ fontSize: 13 }}>Insignias</T.Muted>
          <Text style={s.statNum}>{won}</Text>
        </Pressable>
        <Pressable
          onPress={() => soon('Crear desafío', 'Reta a tus amigos a pasear más minutos esta semana.')}
          style={[s.stat, s.challenge]}
        >
          <T.Black style={{ textAlign: 'center' }}>Crear desafío</T.Black>
        </Pressable>
      </View>

      <View style={s.board}>
        <T.Black>Minutos de paseo esta semana · Villa Luz</T.Black>
        <View style={s.podium}>
          {podium.map((p, i) => {
            const place = ranked.indexOf(p) + 1;
            return (
              <View key={p.name} style={s.podiumCol}>
                <T.Black style={{ fontSize: 13, textAlign: 'center' }} numberOfLines={1}>
                  {p.name}
                </T.Black>
                <View style={[s.podiumAvatar, { backgroundColor: p.color }]}>
                  <Text style={[s.podiumInitial, p.me && { color: '#FFFFFF' }]}>{p.me ? (data.ownerName[0] ?? 'T').toUpperCase() : p.name[0]}</Text>
                </View>
                <View
                  style={[
                    s.podiumBar,
                    { height: heights[i], backgroundColor: p.me ? colors.accent : i === 1 ? colors.blueOutline : colors.blue },
                  ]}
                >
                  <T.Black style={{ fontSize: 14, color: p.me ? '#FFFFFF' : colors.body }}>
                    {place} · {p.minutes}
                  </T.Black>
                </View>
              </View>
            );
          })}
        </View>
        <T.Muted style={{ fontSize: 12, paddingBottom: 10 }}>Luna y Max son vecinos de ejemplo hasta que haya cuentas.</T.Muted>
      </View>

      <Pressable
        onPress={() => soon('Desafío del mes', 'Cada mes habrá un reto del barrio, como conquistar 10 parques.')}
        style={s.monthly}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <T.Black>Desafío del mes: 10 parques</T.Black>
          <T.Bold style={{ color: colors.lilacText }}>Llega con la conquista de parques</T.Bold>
        </View>
        <Icon name="chevronRight" size={20} color={colors.lilacText} strokeWidth={2.2} />
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 140, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.lost,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lost, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  statNum: { fontFamily: fonts.display, fontWeight: '700', fontSize: 22, color: colors.body },
  challenge: { flex: 1.3, backgroundColor: colors.blue, borderWidth: 1.5, borderColor: colors.blueOutline, alignItems: 'center', justifyContent: 'center' },
  board: { backgroundColor: colors.card, borderRadius: 22, paddingTop: 14, paddingHorizontal: 16, gap: 10 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  podiumCol: { flex: 1, alignItems: 'center', gap: 4 },
  podiumAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  podiumInitial: { fontFamily: fonts.display, fontWeight: '700', color: colors.body },
  podiumBar: { width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', paddingTop: 6 },
  monthly: {
    backgroundColor: colors.lilacSoft,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
