import { Modal, StyleSheet, Text, View } from 'react-native';

import { useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import { Button } from './ui';

// Aparece cuando la mascota gana un logro nuevo.
export function CelebrateModal() {
  const { celebrate, dismissCelebrate } = useStore();
  const visible = celebrate.length > 0;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={dismissCelebrate}>
      <View style={s.backdrop}>
        <View style={s.box}>
          <Text style={s.heading}>¡Logro desbloqueado!</Text>
          {celebrate.map((a) => (
            <View key={a.id} style={s.row}>
              <Text style={s.icon}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{a.title}</Text>
                <Text style={s.xp}>+{a.xp} XP</Text>
              </View>
            </View>
          ))}
          <Button label="¡Genial!" onPress={dismissCelebrate} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,37,64,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.lilacSoft,
    borderRadius: radius.lg,
    padding: 22,
    gap: 12,
  },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 34 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  xp: { color: colors.accent, fontWeight: '800' },
});
