import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { DeleteEntry, Input, finish } from '../components/form';
import { BackHeader, Button, T } from '../components/ui';
import { KIND_INFO, activityWord } from '../lib/game';
import { formatDate, parseDate } from '../lib/health';
import { newEntry } from '../lib/routes';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { Entry, EntryKind } from '../lib/types';

const ITEMS: { kind: EntryKind; label?: string; icon: IconName }[] = [
  { kind: 'comida', icon: 'comida' },
  { kind: 'agua', icon: 'agua' },
  { kind: 'peso', icon: 'cuerpo' },
  { kind: 'medicamento', icon: 'medicamento' },
  { kind: 'vacuna', icon: 'vacuna' },
  { kind: 'veterinario', icon: 'cita' },
  { kind: 'novedad', label: 'Novedades', icon: 'sintoma' },
  { kind: 'paseo', icon: 'reloj' },
  { kind: 'nota', label: 'Diario', icon: 'animo' },
];

const NUMBER: Partial<Record<EntryKind, { label: string; placeholder: string }>> = {
  paseo: { label: 'Minutos', placeholder: '30' },
  peso: { label: 'Peso en kg', placeholder: '12,4' },
  agua: { label: 'Mililitros', placeholder: '250' },
};

// Vacuna, medicamento, veterinario y novedades tienen su propia ventana (ver lib/routes).
const OWN_SCREEN: EntryKind[] = ['vacuna', 'medicamento', 'veterinario', 'novedad', 'deposicion', 'enfermedad', 'lesion'];

const NOTE_HINT: Partial<Record<EntryKind, string>> = {
  comida: '150 g de concentrado',
  nota: 'Jugó con Luna en el parque y llegó cansada pero feliz.',
};

const toNumber = (t: string) => Number(t.replace(',', '.'));

const amountOf = (e?: Entry) => {
  const n = e?.minutes ?? e?.kg ?? e?.ml;
  return n === undefined ? '' : String(n).replace('.', ',');
};

// Botón + : "Añadir rápidamente", como en la maqueta. Con id, edita un registro.
export default function Registro() {
  const params = useLocalSearchParams<{ tipo?: EntryKind; id?: string }>();
  const { data, addEntry, updateEntry, removeEntry, startWalk } = useStore();
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const editing = data.entries.find((e) => e.id === params.id);
  const [kind, setKind] = useState<EntryKind | null>(editing?.kind ?? params.tipo ?? null);
  const [amount, setAmount] = useState(amountOf(editing));
  const [note, setNote] = useState(editing?.note ?? '');
  const [date, setDate] = useState(editing ? formatDate(editing.at) : '');

  const pick = (k: EntryKind) => (OWN_SCREEN.includes(k) ? newEntry(k, true) : setKind(k));

  const label = (k: EntryKind) => (k === 'paseo' ? `${word} ya hecho` : KIND_INFO[k].label);

  if (kind) {
    const num = NUMBER[kind];
    const day = editing ? parseDate(date) : null;
    const valid =
      (!num || toNumber(amount) > 0) && (kind !== 'nota' || note.trim().length > 0) && (!editing || day !== null);
    const save = () => {
      const values = {
        minutes: kind === 'paseo' ? toNumber(amount) : undefined,
        kg: kind === 'peso' ? toNumber(amount) : undefined,
        ml: kind === 'agua' ? toNumber(amount) : undefined,
        note: note.trim() || undefined,
      };
      if (editing && day !== null) {
        // Se conserva la hora original y se cambia el día si lo corrigieron.
        const old = new Date(editing.at);
        const at = new Date(day);
        at.setHours(old.getHours(), old.getMinutes());
        updateEntry(editing.id, { ...values, at: at.getTime() });
      } else {
        addEntry({ kind, ...values });
      }
      finish();
    };
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader
          title={editing ? `Editar: ${label(kind).toLowerCase()}` : label(kind)}
          onBack={() => (params.tipo || editing ? router.back() : setKind(null))}
        />
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
          {kind === 'agua' && (
            <View style={s.row}>
              {['100', '250', '500'].map((v) => (
                <Pressable key={v} onPress={() => setAmount(v)} style={[s.choice, amount === v && s.choiceActive]}>
                  <T.Black>+{v} ml</T.Black>
                </Pressable>
              ))}
            </View>
          )}
          {num && (
            <>
              <T.Black>{num.label}</T.Black>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder={num.placeholder}
                placeholderTextColor={colors.textMuted}
                style={s.input}
              />
            </>
          )}
          <T.Black>{kind === 'nota' ? '¿Cómo estuvo su día?' : 'Nota (opcional)'}</T.Black>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={NOTE_HINT[kind] ?? 'Algo que quieras recordar'}
            placeholderTextColor={colors.textMuted}
            style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            multiline
          />
          {editing && <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />}
          {!editing && <T.Muted>{kind === 'paseo' ? 'Gana XP según los minutos.' : `Gana ${KIND_INFO[kind].xp} XP.`}</T.Muted>}
          <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" onPress={save} disabled={!valid} />
          {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Añadir rápidamente" />
      <ScrollView contentContainerStyle={s.page}>
        <Pressable
          onPress={() => {
            if (data.activeWalkStart === null) startWalk();
            router.replace('/paseo');
          }}
          style={s.walk}
        >
          <View style={s.walkIcon}>
            <Icon name="huella" size={24} color="#FFFFFF" />
          </View>
          <T.Black style={{ color: '#FFFFFF', fontSize: 18, flex: 1 }}>
            {data.activeWalkStart === null ? `Iniciar ${word.toLowerCase()} con ${pet.name}` : `Ver ${word.toLowerCase()} en curso`}
          </T.Black>
        </Pressable>

        <T.Black style={{ color: colors.textMuted }}>Registrar a mano</T.Black>
        <View style={s.grid}>
          {ITEMS.map((it) => (
            <Pressable key={it.kind} onPress={() => pick(it.kind)} style={s.item}>
              <View style={s.itemIcon}>
                <Icon name={it.icon} size={22} />
              </View>
              <T.Bold style={{ fontSize: 15, flex: 1 }}>{it.label ?? label(it.kind)}</T.Bold>
            </Pressable>
          ))}
        </View>

        <T.Black style={{ color: colors.textMuted }}>Ayuda urgente</T.Black>
        <View style={s.row}>
          <Pressable onPress={() => router.replace({ pathname: '/reportar', params: { tipo: 'perdida' } })} style={[s.urgent, { borderColor: colors.lost }]}>
            <View style={s.urgentTitle}>
              <View style={[s.dot, { backgroundColor: colors.lost }]} />
              <T.Black style={{ color: colors.lostText }}>Se perdió</T.Black>
            </View>
            <T.Muted style={{ fontSize: 13 }}>Avisa a 2 km</T.Muted>
          </Pressable>
          <Pressable onPress={() => router.replace({ pathname: '/reportar', params: { tipo: 'encontrada' } })} style={[s.urgent, { borderColor: colors.found }]}>
            <View style={s.urgentTitle}>
              <View style={[s.dot, { backgroundColor: colors.found }]} />
              <T.Black style={{ color: colors.foundText }}>Encontré una</T.Black>
            </View>
            <T.Muted style={{ fontSize: 13 }}>Toma una foto</T.Muted>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  walk: {
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
  },
  walkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { backgroundColor: colors.card, borderRadius: 24, padding: 8, flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '50%', minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10 },
  itemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.grey, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  urgent: { flex: 1, minHeight: 72, borderRadius: 20, backgroundColor: colors.card, borderWidth: 2, padding: 12, justifyContent: 'center', gap: 2 },
  urgentTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  choice: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceActive: { backgroundColor: colors.blue, borderColor: colors.blueOutline },
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
