import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { BackHeader, Button, T } from '../components/ui';
import { EXP_FILTERS, entryDetail, entryTitle, expedienteEntries } from '../lib/expediente';
import type { ExpFilter } from '../lib/expediente';
import { shareExpediente } from '../lib/expedienteShare';
import { KIND_INFO } from '../lib/game';
import { formatDate } from '../lib/health';
import { newEntry } from '../lib/routes';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { Entry, EntryKind } from '../lib/types';

const NEW: { kind: EntryKind; label: string }[] = [
  { kind: 'veterinario', label: 'Consulta' },
  { kind: 'vacuna', label: 'Prevención' },
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
  const { userId } = useAuth();
  // Al compartir, cada registro lleva una casilla; empieza sin ninguna marcada.
  const [picked, setPicked] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const list = expedienteEntries(data.entries, filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader
        title="Expediente"
        subtitle={pet.name}
        right={
          Platform.OS !== 'web' && !picked && list.length > 0 ? (
            <Pressable accessibilityLabel="Compartir expediente" onPress={() => (setNotice(''), setPicked([]))} style={s.share}>
              <T.Black style={{ fontSize: 14, color: colors.accent }}>Compartir</T.Black>
            </Pressable>
          ) : null
        }
      />
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
        <Pressable accessibilityLabel="Abrir ficha clínica" onPress={() => router.push('/clinico')} style={s.profile}>
          <T.Body style={{ flex: 1, fontSize: 20 }}>{pet.name}</T.Body>
          <Icon name="chevronRight" size={22} color={colors.accent} strokeWidth={2.4} />
        </Pressable>
        {notice ? <T.Muted style={{ fontSize: 13, marginBottom: 6 }}>{notice}</T.Muted> : null}
        {list.length === 0 && <T.Muted style={{ textAlign: 'center', marginTop: 40 }}>Aún no hay registros. Toca + para empezar.</T.Muted>}
        {list.map((e, i) => (
          <View key={e.id}>
            {(i === 0 || new Date(list[i - 1].at).getFullYear() !== new Date(e.at).getFullYear()) && (
              <T.Black style={s.year}>{new Date(e.at).getFullYear()}</T.Black>
            )}
            <Row
              entry={e}
              checked={picked ? picked.includes(e.id) : undefined}
              onPress={picked ? () => setPicked((p) => (p ?? []).includes(e.id) ? (p ?? []).filter((x) => x !== e.id) : [...(p ?? []), e.id]) : undefined}
            />
          </View>
        ))}
      </ScrollView>

      {picked ? (
        <View style={[s.bar, { paddingBottom: insets.bottom + 12 }]}>
          <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setPicked(null)} />
          <Button
            label={busy ? 'Preparando…' : `Compartir (${picked.length})`}
            kind="solid"
            style={{ flex: 1.4 }}
            disabled={busy || picked.length === 0}
            onPress={async () => {
              setBusy(true);
              try {
                const chosen = list.filter((e) => picked.includes(e.id));
                const { unlinked } = await shareExpediente(data, chosen, userId);
                setNotice(unlinked > 0 ? `${unlinked} PDF adjunto(s) no se incluyeron. Con una cuenta se envían como enlace.` : '');
                setPicked(null);
              } catch {
                setNotice('No se pudo preparar el expediente. Inténtalo de nuevo.');
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>
      ) : (
        <Pressable accessibilityLabel="Agregar al expediente" onPress={() => setAdding(true)} style={[s.fab, { bottom: insets.bottom + 20 }]}>
          <Icon name="mas" size={30} color="#FFFFFF" strokeWidth={2.6} />
        </Pressable>
      )}

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

function Row({ entry, checked, onPress }: { entry: Entry; checked?: boolean; onPress?: () => void }) {
  const detail = entryDetail(entry);
  const docs = entry.files?.length ?? 0;
  return (
    <Pressable accessibilityState={checked === undefined ? undefined : { checked }} onPress={onPress ?? (() => router.push({ pathname: '/vista', params: { id: entry.id } }))} style={s.row}>
      {checked !== undefined && (
        <View style={[s.box, checked && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
          {checked ? <T.Black style={{ color: '#FFFFFF', fontSize: 14 }}>✓</T.Black> : null}
        </View>
      )}
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
  profile: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 60, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: colors.blue, marginTop: 4, marginBottom: 6 },
  share: { height: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: colors.blue, justifyContent: 'center' },
  bar: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.bg },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.blueOutline, alignItems: 'center', justifyContent: 'center' },
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
