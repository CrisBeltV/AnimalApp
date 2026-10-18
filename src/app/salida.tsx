import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chips, DeleteEntry, Input, ParkPicker, ProviderPicker, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { NEW_PARK_XP, WALK_TYPES, activityWord, walkXp } from '../lib/game';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const WHO = [
  { id: 'yo', label: 'Yo' },
  { id: 'paseador', label: 'Un paseador' },
];

// Registrar o editar un paseo: tipo, minutos, parque y quién lo hizo.
export default function Salida() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const f = editing?.fields ?? {};
  const [tipo, setTipo] = useState(f.tipo ?? (pet.species === 'gato' ? 'juego' : 'paseo'));
  const [minutes, setMinutes] = useState(editing?.minutes ? String(editing.minutes) : '');
  const [date, setDate] = useState(formatDate(editing?.at ?? Date.now()));
  const [park, setPark] = useState<string | undefined>(f.parqueId);
  const [who, setWho] = useState(f.paseadorId ? 'paseador' : 'yo');
  const [walker, setWalker] = useState<string | undefined>(f.paseadorId);
  const [daycare, setDaycare] = useState<string | undefined>(f.guarderiaId);
  const [note, setNote] = useState(editing?.note ?? '');

  const mins = Number(minutes.replace(',', '.'));
  const day = parseDate(date);
  const valid = mins > 0 && day !== null;
  const parkIsNew = park && !data.entries.some((e) => e.id !== editing?.id && e.kind === 'paseo' && e.fields?.parqueId === park);

  const save = () => {
    const fields: Record<string, string> = { tipo };
    if (park) fields.parqueId = park;
    if (tipo === 'guarderia' && daycare) fields.guarderiaId = daycare;
    if (tipo !== 'guarderia' && who === 'paseador' && walker) fields.paseadorId = walker;
    const time = new Date(editing?.at ?? Date.now());
    const at = new Date(day!);
    at.setHours(time.getHours(), time.getMinutes());
    const values = { minutes: mins, fields, note: note.trim() || undefined, at: at.getTime() };
    if (editing) updateEntry(editing.id, values);
    else addEntry({ kind: 'paseo', ...values });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? `Editar ${activityWord(pet.species).toLowerCase()}` : `${activityWord(pet.species)} ya hecho`} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <T.Black>Tipo de actividad</T.Black>
        <Chips options={WALK_TYPES} value={tipo} onChange={setTipo} />
        <Input field={{ key: 'min', label: 'Minutos', placeholder: '30', number: true, required: true }} value={minutes} onChange={setMinutes} />
        <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />

        <Card style={{ gap: 10 }}>
          <T.Black>Parque</T.Black>
          <T.Muted style={{ fontSize: 13 }}>Los minutos se suman al parque para conquistarlo.</T.Muted>
          <ParkPicker value={park} onChange={setPark} />
          {parkIsNew ? <T.Black style={{ color: colors.foundText, fontSize: 14 }}>¡Parque nuevo! +{NEW_PARK_XP} XP</T.Black> : null}
        </Card>

        {tipo === 'guarderia' ? (
          <Card style={{ gap: 10 }}>
            <T.Black>Guardería</T.Black>
            <ProviderPicker type="guarderia" value={daycare} onChange={setDaycare} />
          </Card>
        ) : (
          <Card style={{ gap: 10 }}>
            <T.Black>¿Quién lo llevó?</T.Black>
            <Chips options={WHO} value={who} onChange={setWho} />
            {who === 'paseador' && <ProviderPicker type="paseador" value={walker} onChange={setWalker} />}
          </Card>
        )}

        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: 'Jugó con Luna, conoció un amigo…', multiline: true }} value={note} onChange={setNote} />
        {mins > 0 && <T.Muted>Gana {walkXp(mins) + (parkIsNew ? NEW_PARK_XP : 0)} XP.</T.Muted>}
        <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" disabled={!valid} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
