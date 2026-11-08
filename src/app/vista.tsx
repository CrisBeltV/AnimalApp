import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Files } from '../components/Files';
import { BackHeader, Button, Card, T } from '../components/ui';
import { entryTitle, previewRows } from '../lib/expediente';
import { openEntry } from '../lib/routes';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// Vista previa de un registro ya hecho. Para cambiarlo se toca "Editar".
export default function Vista() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useStore();
  const entry = data.entries.find((e) => e.id === id);
  const pet = data.pet!;

  if (!entry) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader title="Registro" subtitle={pet.name} />
        <T.Muted style={{ textAlign: 'center', marginTop: 40 }}>Este registro ya no existe.</T.Muted>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={entryTitle(entry)} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page}>
        <Card style={{ gap: 12 }}>
          {previewRows(entry).map((r) => (
            <View key={r.label} style={{ gap: 2 }}>
              <T.Muted style={{ fontSize: 13 }}>{r.label}</T.Muted>
              <T.Black style={{ fontSize: 16 }}>{r.value}</T.Black>
            </View>
          ))}
        </Card>
        {(entry.files?.length ?? 0) > 0 && <Files readOnly files={entry.files ?? []} onChange={() => {}} />}
        <Button label="Editar" kind="solid" onPress={() => openEntry(entry)} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
