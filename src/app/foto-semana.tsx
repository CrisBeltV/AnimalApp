import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DeleteEntry, Input, PhotoSet, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const POSES = [
  { side: 'De lado', tip: 'De pie, de perfil, con el teléfono a la altura de su lomo.' },
  { side: 'De frente', tip: 'Mirando a la cámara, agáchate a su altura.' },
  { side: 'Desde arriba', tip: 'De pie, toma la foto desde encima de su lomo.' },
];

// Foto de la semana con guía de poses. Sirve para ver el crecimiento y armar el modelo 3D.
export default function FotoSemana() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []);
  const [note, setNote] = useState(editing?.note ?? '');

  const save = () => {
    const values = { photos, note: note.trim() || undefined };
    if (editing) updateEntry(editing.id, values);
    else addEntry({ kind: 'foto', ...values });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar foto semanal' : 'Foto de la semana'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 8, backgroundColor: colors.lilacSoft }}>
          <T.Black>Guía de poses</T.Black>
          {POSES.map((p, i) => (
            <T.Body key={p.side}>
              <T.Black style={{ fontSize: 15 }}>{i + 1}. {p.side}: </T.Black>
              {p.tip}
            </T.Body>
          ))}
          <T.Muted style={{ fontSize: 13 }}>Usa buena luz y un fondo liso. Estas fotos ayudarán a crear su modelo 3D.</T.Muted>
        </Card>
        <PhotoSet photos={photos} onChange={setPhotos} sides={POSES.map((p) => p.side)} />
        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: 'Cómo ha cambiado esta semana', multiline: true }} value={note} onChange={setNote} />
        <Button label={editing ? 'Guardar cambios' : 'Guardar fotos'} kind="solid" disabled={!photos.some(Boolean)} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
