import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chips, DeleteEntry, Input, PhotoSet, finish } from '../components/form';
import { BackHeader, Button, T } from '../components/ui';
import { MOODS } from '../lib/game';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// ¿Cómo está hoy? Feliz, tranquilo, ansioso o decaído, con nota y foto.
export default function Animo() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const [estado, setEstado] = useState<string | undefined>(editing?.fields?.estado);
  const [note, setNote] = useState(editing?.fields?.nota ?? '');
  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []);

  const save = () => {
    const mood = MOODS.find((m) => m.id === estado)!;
    const fields: Record<string, string> = { estado: mood.id };
    if (note.trim()) fields.nota = note.trim();
    const values = { fields, photos: photos.filter(Boolean), note: [`${mood.icon} ${mood.label}`, note.trim()].filter(Boolean).join(' · ') };
    if (editing) updateEntry(editing.id, values);
    else addEntry({ kind: 'animo', ...values });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar ánimo' : `¿Cómo está ${pet.name} hoy?`} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Chips options={MOODS} value={estado} onChange={setEstado} />
        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: '¿Qué pasó hoy?', multiline: true }} value={note} onChange={setNote} />
        <T.Black>Foto (opcional)</T.Black>
        <View style={{ width: '50%' }}>
          <PhotoSet photos={photos} onChange={setPhotos} sides={['Foto de hoy']} />
        </View>
        <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" disabled={!estado} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
