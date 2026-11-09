import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Files } from '../components/Files';
import { BackHeader, Button, Card, T } from '../components/ui';
import { entryTitle, isExpediente, previewRows } from '../lib/expediente';
import { KIND_INFO, activityWord } from '../lib/game';
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

  const title = isExpediente(entry) ? entryTitle(entry) : entry.kind === 'paseo' ? activityWord(pet.species) : (KIND_INFO[entry.kind]?.label ?? '');
  // Los registros viejos guardaban las fotos como direcciones sueltas.
  const files = entry.files ?? (entry.photos ?? []).filter(Boolean).map((uri, i) => ({ id: `foto-${i}`, uri, type: 'image' as const, name: `foto-${i + 1}.jpg` }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={title} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page}>
        <Card style={{ gap: 12 }}>
          {previewRows(entry, { parks: data.parks, providers: data.providers }).map((r) => (
            <View key={r.label} style={{ gap: 2 }}>
              <T.Muted style={{ fontSize: 13 }}>{r.label}</T.Muted>
              <T.Black style={{ fontSize: 16 }}>{r.value}</T.Black>
            </View>
          ))}
        </Card>
        {files.length > 0 && <Files readOnly files={files} onChange={() => {}} />}
        <Button label="Editar" kind="solid" onPress={() => openEntry(entry)} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
