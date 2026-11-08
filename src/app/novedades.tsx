import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { BackHeader, EntryRow, T } from '../components/ui';
import { newEntry } from '../lib/routes';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const KINDS = ['novedad', 'deposicion', 'enfermedad', 'lesion'];

// Novedades o comportamiento inusual: las anotadas y el botón para añadir una nueva.
export default function Novedades() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const pet = data.pet!;
  const list = data.entries.filter((e) => KINDS.includes(e.kind));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Novedades" subtitle={pet.name} />
      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 110 }]}>
        {list.length === 0 && <T.Muted style={{ textAlign: 'center', marginTop: 40 }}>Deposiciones, vómito, babeo, cojera, lesiones y más. Toca + para anotar una.</T.Muted>}
        {list.map((e) => (
          <EntryRow key={e.id} entry={e} species={pet.species} />
        ))}
      </ScrollView>
      <Pressable accessibilityLabel="Añadir novedad" onPress={() => newEntry('novedad')} style={[s.fab, { bottom: insets.bottom + 20 }]}>
        <Icon name="mas" size={30} color="#FFFFFF" strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 4, width: '100%', maxWidth: 560, alignSelf: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
