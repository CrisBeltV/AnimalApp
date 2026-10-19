import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Check, Chips, DeleteEntry, Input, ProviderPicker, ReminderSheet, finish } from '../components/form';
import type { RemindTarget } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { GROOMING, groomingTypes } from '../lib/game';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const WHO = [
  { id: 'yo', label: 'Yo' },
  { id: 'peluqueria', label: 'Peluquería o groomer' },
];

// Higiene y cuidados (baño, uñas, peluquería, desparasitación, oídos, otro): uno o varios a la vez,
// con la próxima fecha y su recordatorio.
export default function Higiene() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const f = editing?.fields ?? {};
  const [tipos, setTipos] = useState<string[]>(editing ? groomingTypes(editing) : []);
  const [other, setOther] = useState(f.otro ?? '');
  const [date, setDate] = useState(formatDate(editing?.at ?? Date.now()));
  const [who, setWho] = useState(f.peluqueriaId ? 'peluqueria' : 'yo');
  const [groomer, setGroomer] = useState<string | undefined>(f.peluqueriaId);
  const [next, setNext] = useState(f.proxima ?? '');
  const [note, setNote] = useState(f.nota ?? '');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [targets, setTargets] = useState<RemindTarget[]>([]);

  const day = parseDate(date);
  const toggle = (id: string) => setTipos((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const label = tipos
    .map((id) => (id === 'otro' && other.trim() ? other.trim() : GROOMING.find((g) => g.id === id)?.label))
    .filter(Boolean)
    .join(', ');
  const valid = tipos.length > 0 && day !== null && (!next.trim() || parseDate(next) !== null);

  const save = () => {
    const fields: Record<string, string> = { tipo: tipos[0], tipos: tipos.join(',') };
    if (tipos.includes('otro') && other.trim()) fields.otro = other.trim();
    if (who === 'peluqueria' && groomer) fields.peluqueriaId = groomer;
    if (next.trim()) fields.proxima = next.trim();
    if (note.trim()) fields.nota = note.trim();
    const time = new Date(editing?.at ?? Date.now());
    const at = new Date(day!);
    at.setHours(time.getHours(), time.getMinutes());
    const groomerName = data.providers.find((p) => p.id === fields.peluqueriaId)?.name;
    const values = { fields, note: [label, groomerName, note.trim()].filter(Boolean).join(' · '), at: at.getTime() };
    let id: string;
    if (editing) {
      updateEntry(editing.id, values);
      id = editing.id;
    } else {
      id = addEntry({ kind: 'higiene', ...values });
    }
    const when = parseDate(next);
    if (when && when > Date.now() && !data.reminders.some((r) => r.entryId === id)) {
      setTargets([{ title: `${label} de ${pet.name}`, at: when }]);
      setSavedId(id);
    } else {
      finish();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar higiene' : 'Higiene y cuidados'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <T.Black>¿Qué le hiciste? Puedes elegir varias</T.Black>
        <View style={{ gap: 8 }}>
          {GROOMING.map((g) => (
            <Check key={g.id} label={`${g.icon} ${g.label}`} on={tipos.includes(g.id)} onPress={() => toggle(g.id)} />
          ))}
        </View>
        {tipos.includes('otro') && (
          <Input field={{ key: 'otro', label: '¿Qué otro cuidado?', placeholder: 'Limpieza de dientes, glándulas…' }} value={other} onChange={setOther} />
        )}
        <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />
        <Card style={{ gap: 10 }}>
          <T.Black>¿Quién lo hizo?</T.Black>
          <Chips options={WHO} value={who} onChange={setWho} />
          {who === 'peluqueria' && <ProviderPicker type="peluqueria" value={groomer} onChange={setGroomer} />}
        </Card>
        <Input field={{ key: 'proxima', label: 'Próxima vez', placeholder: 'DD/MM/AAAA', date: true }} value={next} onChange={setNext} />
        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: 'Champú, se portó bien…', multiline: true }} value={note} onChange={setNote} />
        <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" disabled={!valid} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
      <ReminderSheet entryId={savedId} petName={pet.name} targets={targets} onDone={finish} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
