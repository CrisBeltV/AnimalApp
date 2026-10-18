import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader, Bar, Card, T } from '../components/ui';
import { ACHIEVEMENTS, MAX_LEVEL, levelInfo, totalXp } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';

// Nivel, XP e insignias.
export default function Logros() {
  const { data } = useStore();
  const lvl = levelInfo(totalXp(data));
  const won = ACHIEVEMENTS.filter((a) => data.unlocked.includes(a.id)).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Nivel e insignias" />
      <ScrollView contentContainerStyle={s.page}>
        <Card style={{ gap: 10, backgroundColor: colors.lilacSoft }}>
          <View style={s.between}>
            <Text style={s.level}>Nivel {lvl.level}</Text>
            <T.Muted>de {MAX_LEVEL}</T.Muted>
          </View>
          <Bar value={lvl.progress * 100} color={colors.lilacStrong} track="#FFFFFF" />
          <T.Bold>
            {lvl.level < MAX_LEVEL ? `${lvl.totalXp} / ${lvl.next} XP para el nivel ${lvl.level + 1}` : `${lvl.totalXp} XP · nivel máximo por ahora`}
          </T.Bold>
          <T.Muted style={{ fontSize: 13 }}>Ganas XP con cada registro, paseo, misión del día e insignia.</T.Muted>
        </Card>

        <T.Black>
          Insignias · {won} de {ACHIEVEMENTS.length}
        </T.Black>
        <View style={s.grid}>
          {ACHIEVEMENTS.map((a) => {
            const got = data.unlocked.includes(a.id);
            return (
              <View key={a.id} style={[s.badge, got && s.badgeGot]}>
                <Text style={{ fontSize: 28, opacity: got ? 1 : 0.3 }}>{a.icon}</Text>
                <T.Black style={{ fontSize: 15 }}>{a.title}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>{a.description}</T.Muted>
                <T.Black style={{ fontSize: 13, color: got ? colors.accent : colors.textMuted }}>
                  {got ? 'Ganada' : `+${a.xp} XP`}
                </T.Black>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  level: { fontFamily: fonts.display, fontWeight: '700', fontSize: 30, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    flexBasis: '45%',
    flexGrow: 1,
    padding: 12,
    gap: 2,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.grey,
  },
  badgeGot: { backgroundColor: colors.blue, borderColor: colors.blueOutline },
});
