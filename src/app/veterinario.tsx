import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { DeleteEntry, Input, ReminderSheet, finish } from '../components/form';
import type { RemindTarget } from '../components/form';
import { Icon } from '../components/Icon';
import { BackHeader, Button, Card, T } from '../components/ui';
import { formatDate, parseDate } from '../lib/health';
import type { Field } from '../lib/health';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { Vet } from '../lib/types';

const VET_FIELDS: Field[] = [
  { key: 'veterinaria', label: 'Nombre de la veterinaria', placeholder: 'Clínica Veterinaria…', required: true },
  { key: 'direccion', label: 'Dirección', placeholder: 'Calle 72 # 110-20' },
  { key: 'ubicacion', label: 'Barrio o ubicación', placeholder: 'Villa Luz, Engativá' },
  { key: 'doctor', label: 'Nombre del doctor', placeholder: 'Dra. Gómez' },
  { key: 'telefono', label: 'Teléfono', placeholder: '300 000 0000', number: true },
];

const VISIT_FIELDS: Field[] = [
  { key: 'fecha', label: 'Fecha de la cita', placeholder: 'DD/MM/AAAA', required: true, date: true },
  { key: 'motivo', label: 'Motivo de la cita', placeholder: 'Control, vacuna, malestar…' },
  { key: 'proxima', label: 'Próxima cita', placeholder: 'DD/MM/AAAA', date: true, remind: 'Próxima cita' },
  { key: 'nota', label: 'Lo que dijo el veterinario', placeholder: 'Diagnóstico, indicaciones…', multiline: true },
];

const VET_KEYS: Record<string, keyof Vet> = {
  veterinaria: 'name',
  direccion: 'address',
  ubicacion: 'place',
  doctor: 'doctor',
  telefono: 'phone',
};

// Cita al veterinario. La veterinaria queda guardada para buscarla la próxima vez.
export default function Veterinario() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry, saveVet } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const [values, setValues] = useState<Record<string, string>>((): Record<string, string> => {
    if (editing?.fields) return { ...editing.fields };
    if (editing) return { nota: editing.note ?? '', fecha: formatDate(editing.at) };
    return { fecha: formatDate(Date.now()) };
  });
  const [vetId, setVetId] = useState<string | undefined>(editing?.fields?.vetId);
  const [query, setQuery] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [targets, setTargets] = useState<RemindTarget[]>([]);

  const set = (k: string) => (v: string) => {
    setValues((x) => ({ ...x, [k]: v }));
    if (k in VET_KEYS) setVetId(undefined); // cambió la veterinaria: se guarda como nueva
  };
  const val = (k: string) => (values[k] ?? '').trim();
  const all = [...VET_FIELDS, ...VISIT_FIELDS];
  const invalid = all.some((f) => (f.required && !val(f.key)) || (f.date && val(f.key) && parseDate(val(f.key)) === null));

  const q = query.trim().toLowerCase();
  const results = q ? data.vets.filter((v) => v.name.toLowerCase().includes(q)) : [];

  const choose = (v: Vet) => {
    setValues((x) => ({
      ...x,
      veterinaria: v.name,
      direccion: v.address ?? '',
      ubicacion: v.place ?? '',
      doctor: v.doctor ?? '',
      telefono: v.phone ?? '',
    }));
    setVetId(v.id);
    setQuery('');
  };

  const save = () => {
    const vet = {
      id: vetId,
      name: val('veterinaria'),
      address: val('direccion') || undefined,
      place: val('ubicacion') || undefined,
      doctor: val('doctor') || undefined,
      phone: val('telefono') || undefined,
    };
    const same = data.vets.find((v) => v.name.toLowerCase() === vet.name.toLowerCase());
    const id = saveVet({ ...vet, id: vet.id ?? same?.id });
    const clean = Object.fromEntries(Object.entries({ ...values, vetId: id }).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    const day = parseDate(clean.fecha) ?? Date.now();
    const at = new Date(day).toDateString() === new Date().toDateString() ? Date.now() : day + 12 * 3600000;
    const note = [clean.veterinaria, clean.doctor, clean.motivo].filter(Boolean).join(' · ');
    let entryId: string;
    if (editing) {
      updateEntry(editing.id, { fields: clean, note, at });
      entryId = editing.id;
    } else {
      entryId = addEntry({ kind: 'veterinario', fields: clean, note, at });
    }
    const next = parseDate(clean.proxima);
    if (next && next > Date.now() && !data.reminders.some((r) => r.entryId === entryId)) {
      setTargets([{ title: `Próxima cita en ${clean.veterinaria}`, at: next }]);
      setSavedId(entryId);
    } else {
      finish();
    }
  };

  const mapQuery = [val('direccion'), val('ubicacion'), 'Bogotá'].filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar cita' : 'Cita al veterinario'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 10 }}>
          <T.Black>Buscar veterinaria</T.Black>
          <View style={s.search}>
            <Icon name="lista" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Escribe el nombre"
              placeholderTextColor={colors.textMuted}
              style={s.searchInput}
            />
          </View>
          {results.map((v) => (
            <Pressable key={v.id} onPress={() => choose(v)} style={s.result}>
              <View style={{ flex: 1 }}>
                <T.Black>{v.name}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>{[v.doctor, v.address, v.place].filter(Boolean).join(' · ') || 'Guardada por ti'}</T.Muted>
              </View>
              <T.Black style={{ color: colors.accent, fontSize: 14 }}>Usar</T.Black>
            </Pressable>
          ))}
          {q && results.length === 0 ? <T.Muted style={{ fontSize: 13 }}>No la encontramos. Escribe sus datos abajo y quedará guardada.</T.Muted> : null}
          <View style={s.soonBox}>
            <T.Muted style={{ fontSize: 13, color: colors.lilacText }}>
              Muy pronto las veterinarias y tiendas de mascotas podrán registrarse como aliadas, y aparecerán aquí con sus datos.
            </T.Muted>
          </View>
        </Card>

        {vetId ? (
          <T.Muted style={{ fontSize: 13 }}>Usando una veterinaria que ya tenías guardada. Si cambias sus datos, se actualizan.</T.Muted>
        ) : null}
        {VET_FIELDS.map((f) => (
          <Input key={f.key} field={f} value={values[f.key] ?? ''} onChange={set(f.key)} />
        ))}
        {(val('direccion') || val('ubicacion')) && (
          <Button
            label="Ver ubicación en el mapa"
            kind="secondary"
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`)}
          />
        )}
        <T.Black style={{ color: colors.textMuted, marginTop: 6 }}>La cita</T.Black>
        {VISIT_FIELDS.map((f) => (
          <Input key={f.key} field={f} value={values[f.key] ?? ''} onChange={set(f.key)} />
        ))}
        <Button label={editing ? 'Guardar cambios' : 'Guardar cita'} kind="solid" disabled={invalid} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
      <ReminderSheet entryId={savedId} petName={pet.name} targets={targets} onDone={finish} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: fonts.body, color: colors.body, minHeight: 44 },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.blue,
  },
  soonBox: { backgroundColor: colors.lilacSoft, borderRadius: 14, padding: 10 },
});
