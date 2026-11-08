import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { BackHeader, Button, T } from '../components/ui';
import { EXP_FILTERS, entryDetail, entryTitle, expedienteEntries, profileLines } from '../lib/expediente';
import type { ExpFilter } from '../lib/expediente';
import { KIND_INFO, lastWeight } from '../lib/game';
import { formatDate } from '../lib/health';
import { newEntry, openEntry } from '../lib/routes';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { Entry, EntryKind } from '../lib/types';

const NEW: { kind: EntryKind; label: string }[] = [
  { kind: 'veterinario', label: 'Consulta' },
  { kind: 'vacuna', label: 'Vacuna' },
  { kind: 'medicamento', label: 'Tratamiento' },
  { kind: 'documento', label: 'Documento' },
];

// Hoja de vida de la mascota: todo lo clínico en una sola línea de tiempo.
export default function Expediente() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const pet = data.pet!;
  const [filter, setFilter] = useState<ExpFilter>('todo');
  const [adding, setAdding] = useState(false);
  const list = expedienteEntries(data.entries, filter);
  const profile = profileLines(pet, data.clinical, lastWeight(data.entries));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Expediente" subtitle={pet.name} />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {EXP_FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(f.id)}
                style={[s.chip, on && { backgroundColor: colors.blue, borderColor: colors.accent }]}
              >
                <T.Black style={{ fontSize: 15 }}>{f.label}</T.Black>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 110 }]}>
        <Pressable accessibilityLabel="Editar ficha clínica" onPress={() => router.push('/clinico')} style={s.profile}>
          <View style={{ flex: 1, gap: 2 }}>
            <T.Black>{profile.empty ? 'Completar la ficha clínica' : profile.basics}</T.Black>
            {profile.empty && <T.Muted style={{ fontSize: 13 }}>Sexo, microchip, alergias y condiciones</T.Muted>}
            {profile.allergies ? <T.Bold style={{ fontSize: 14, color: colors.lostText }}>Alergias: {profile.allergies}</T.Bold> : null}
            {profile.conditions ? <T.Bold style={{ fontSize: 14 }}>Condiciones: {profile.conditions}</T.Bold> : null}
          </View>
          <Icon name="chevronRight" size={20} color={colors.textMuted} />
        </Pressable>
        {list.length === 0 && <T.Muted style={{ textAlign: 'center', marginTop: 40 }}>Aún no hay registros. Toca + para empezar.</T.Muted>}
        {list.map((e, i) => (
          <View key={e.id}>
            {(i === 0 || new Date(list[i - 1].at).getFullYear() !== new Date(e.at).getFullYear()) && (
              <T.Black style={s.year}>{new Date(e.at).getFullYear()}</T.Black>
            )}
            <Row entry={e} />
          </View>
        ))}
      </ScrollView>

      <Pressable accessibilityLabel="Agregar al expediente" onPress={() => setAdding(true)} style={[s.fab, { bottom: insets.bottom + 20 }]}>
        <Icon name="mas" size={30} color="#FFFFFF" strokeWidth={2.6} />
      </Pressable>

      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <Pressable style={s.backdrop} onPress={() => setAdding(false)}>
          <View style={s.sheet}>
            {NEW.map((n) => (
              <Button
                key={n.kind}
                label={`${KIND_INFO[n.kind].icon}  ${n.label}`}
                kind="secondary"
                onPress={() => {
                  setAdding(false);
                  newEntry(n.kind);
                }}
              />
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function Row({ entry }: { entry: Entry }) {
  const detail = entryDetail(entry);
  const docs = entry.files?.length ?? 0;
  return (
    <Pressable onPress={() => openEntry(entry)} style={s.row}>
      <Text style={{ fontSize: 24 }}>{KIND_INFO[entry.kind].icon}</Text>
      <View style={{ flex: 1 }}>
        <T.Black style={{ fontSize: 16 }} numberOfLines={1}>
          {entryTitle(entry)}
        </T.Black>
        {detail ? (
          <T.Muted style={{ fontSize: 13 }} numberOfLines={2}>
            {detail}
          </T.Muted>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <T.Muted style={{ fontSize: 13 }}>{formatDate(entry.at)}</T.Muted>
        {docs > 0 ? <T.Muted style={{ fontSize: 13 }}>📎 {docs}</T.Muted> : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 4, width: '100%', maxWidth: 560, alignSelf: 'center' },
  filters: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.blueOutline,
    justifyContent: 'center',
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 20, backgroundColor: colors.blue, marginTop: 4, marginBottom: 6 },
  year: { color: colors.textMuted, marginTop: 14, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: colors.card,
  },
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
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 28, padding: 20, gap: 12 },
});
