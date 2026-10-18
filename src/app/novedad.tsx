import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Check, DeleteEntry, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { SIGN_GROUPS, SIGN_LABEL } from '../lib/health';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

// Novedades o comportamiento inusual: reemplaza a "Deposiciones" y "Síntomas o lesiones".
export default function Novedad() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const [signs, setSigns] = useState<string[]>(() => {
    if (editing?.signs) return editing.signs;
    if (editing?.kind === 'lesion') return ['lesion'];
    if (editing?.kind === 'deposicion') return ['normales'];
    return [];
  });
  const [where, setWhere] = useState(editing?.fields?.lesionDonde ?? '');
  const [note, setNote] = useState(editing?.note && !editing.signs ? editing.note : (editing?.fields?.nota ?? ''));

  const toggle = (id: string) =>
    setSigns((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      // "Normales" no va junto con otros cambios en las deposiciones.
      const poop = ['duras', 'blandas', 'moco'];
      if (id === 'normales') return [...list.filter((x) => !poop.includes(x)), id];
      if (poop.includes(id)) return [...list.filter((x) => x !== 'normales'), id];
      return [...list, id];
    });

  const worrying = signs.some((x) => x !== 'normales');
  const valid = signs.length > 0 || note.trim().length > 0;

  const save = () => {
    const fields: Record<string, string> = {};
    if (signs.includes('lesion') && where.trim()) fields.lesionDonde = where.trim();
    if (note.trim()) fields.nota = note.trim();
    const summary = [...signs.map((x) => SIGN_LABEL[x]), note.trim()].filter(Boolean).join(' · ');
    const entry = { signs, fields, note: summary };
    if (editing && editing.kind === 'novedad') {
      updateEntry(editing.id, entry);
    } else {
      // Un registro viejo (deposición, síntoma o lesión) pasa a ser novedad.
      if (editing) removeEntry(editing.id);
      addEntry({ kind: 'novedad', at: editing?.at, ...entry });
    }
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar novedad' : 'Novedades'} subtitle={`Comportamiento inusual de ${pet.name}`} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <T.Muted>Marca todo lo que notes. Puedes elegir varias cosas.</T.Muted>
        {SIGN_GROUPS.map((g) => (
          <Card key={g.title} style={{ gap: 8 }}>
            <T.Black>{g.title}</T.Black>
            {g.signs.map((x) => (
              <Check key={x.id} label={x.label} on={signs.includes(x.id)} onPress={() => toggle(x.id)} />
            ))}
            {g.title === 'Lesiones' && signs.includes('lesion') && (
              <TextInput
                value={where}
                onChangeText={setWhere}
                placeholder="¿Dónde está? Ej.: corte en la pata trasera"
                placeholderTextColor={colors.textMuted}
                style={s.input}
              />
            )}
          </Card>
        ))}
        <T.Black>Otra cosa que notaste (opcional)</T.Black>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Desde cuándo, cuántas veces, qué comió…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[s.input, { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' }]}
        />
        {worrying && (
          <Card style={{ backgroundColor: colors.lostSoft, gap: 4 }}>
            <T.Black style={{ color: colors.lostText }}>Ten presente</T.Black>
            <T.Body>Si dura más de un día, se repite o ves sangre, consulta a tu veterinario. La app solo guarda lo que observas.</T.Body>
          </Card>
        )}
        <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" disabled={!valid} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.grey,
    paddingHorizontal: 14,
    fontSize: 17,
    fontFamily: fonts.body,
    color: colors.body,
  },
});
