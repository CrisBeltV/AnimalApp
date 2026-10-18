import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BodyGuide } from '../components/BodyGuide';
import { DeleteEntry, Input, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const num = (t: string) => Number(t.replace(',', '.'));

// Peso, tamaño y condición corporal (flaco, ideal, sobrepeso) con guía visual.
export default function Medidas() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const f = editing?.fields ?? {};
  const [kg, setKg] = useState(editing?.kg ? String(editing.kg).replace('.', ',') : '');
  const [alto, setAlto] = useState(f.alto ?? '');
  const [largo, setLargo] = useState(f.largo ?? '');
  const [condicion, setCondicion] = useState<string | undefined>(f.condicion);
  const [date, setDate] = useState(formatDate(editing?.at ?? Date.now()));
  const [note, setNote] = useState(editing?.note ?? '');
  const day = parseDate(date);
  const valid = num(kg) > 0 && day !== null;

  const save = () => {
    const fields: Record<string, string> = {};
    if (alto.trim()) fields.alto = alto.trim();
    if (largo.trim()) fields.largo = largo.trim();
    if (condicion) fields.condicion = condicion;
    const time = new Date(editing?.at ?? Date.now());
    const at = new Date(day!);
    at.setHours(time.getHours(), time.getMinutes());
    const values = { kg: num(kg), fields, note: note.trim() || undefined, at: at.getTime() };
    if (editing) updateEntry(editing.id, values);
    else addEntry({ kind: 'peso', ...values });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar medidas' : 'Peso y medidas'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Input field={{ key: 'kg', label: 'Peso en kg', placeholder: '12,4', number: true, required: true }} value={kg} onChange={setKg} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Input field={{ key: 'alto', label: 'Altura (cm)', placeholder: '45', number: true }} value={alto} onChange={setAlto} />
          </View>
          <View style={{ flex: 1 }}>
            <Input field={{ key: 'largo', label: 'Largo (cm)', placeholder: '60', number: true }} value={largo} onChange={setLargo} />
          </View>
        </View>
        <T.Muted style={{ fontSize: 13 }}>Altura: del piso a la cruz (entre los hombros). Largo: del pecho al inicio de la cola.</T.Muted>
        <Card style={{ gap: 10 }}>
          <T.Black>Condición corporal</T.Black>
          <T.Muted style={{ fontSize: 13 }}>Mira a {pet.name} desde arriba y toca la figura que más se parece.</T.Muted>
          <BodyGuide value={condicion} onChange={setCondicion} />
        </Card>
        <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />
        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: 'Pesada en la veterinaria…', multiline: true }} value={note} onChange={setNote} />
        <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" disabled={!valid} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
