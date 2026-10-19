import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chips, DeleteEntry, Input, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { foodStatus } from '../lib/game';
import { allFoods, forGrams } from '../lib/foods';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

const GRAMS = ['50', '100', '150', '200', '250'].map((g) => ({ id: g, label: `${g} g` }));

// Registrar una comida: qué alimento y cuántos gramos. Con la tabla nutricional
// del alimento se calcula lo que aportó esa comida.
export default function Comida() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const f = editing?.fields ?? {};
  const foods = allFoods(data.entries);
  const current = foodStatus(data.entries, Date.now())?.food;
  const defaultFood = foods.find((x) => x.id === `mio:${current?.id}`) ?? foods.find((x) => x.group === 'Tus alimentos');

  const [foodId, setFoodId] = useState<string | undefined>(f.alimentoId ?? (editing ? undefined : defaultFood?.id));
  const [grams, setGrams] = useState(f.gramos ?? (current?.fields?.porcion || ''));
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(formatDate(editing?.at ?? Date.now()));
  const [note, setNote] = useState(f.nota ?? (editing && !f.gramos ? (editing.note ?? '') : ''));

  const food = foods.find((x) => x.id === foodId);
  const g = Number(grams.replace(',', '.'));
  const day = parseDate(date);
  const valid = !!food && g > 0 && day !== null;
  const n = food && g > 0 ? forGrams(food, g) : null;
  const q = query.trim().toLowerCase();
  const results = foods.filter((x) => !q || x.name.toLowerCase().includes(q) || x.group.toLowerCase().includes(q));

  const save = () => {
    if (!food || !n) return;
    const fields: Record<string, string> = {
      alimentoId: food.id,
      alimentoNombre: food.name,
      gramos: String(g),
      kcal: String(n.kcal),
      proteina: String(n.proteina),
      grasa: String(n.grasa),
      fibra: String(n.fibra),
    };
    if (note.trim()) fields.nota = note.trim();
    const sameDay = new Date(day!).toDateString() === new Date(editing?.at ?? Date.now()).toDateString();
    const at = editing && sameDay ? editing.at : new Date(day!).toDateString() === new Date().toDateString() ? Date.now() : day! + 12 * 3600000;
    const values = { fields, at, note: [`${g} g de ${food.name}`, note.trim()].filter(Boolean).join(' · ') };
    if (editing) updateEntry(editing.id, values);
    else addEntry({ kind: 'comida', ...values });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar comida' : 'Registrar comida'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 10 }}>
          <T.Black>
            Alimento<T.Black style={{ color: colors.lostText }}> *</T.Black>
          </T.Black>
          {food ? (
            <View style={s.picked}>
              <View style={{ flex: 1 }}>
                <T.Black>{food.name}</T.Black>
                <T.Muted style={{ fontSize: 12 }}>
                  {food.kcal} kcal · {food.proteina} g proteína por cada 100 g
                </T.Muted>
              </View>
              <Pressable accessibilityLabel="Cambiar alimento" onPress={() => setFoodId(undefined)} style={s.small}>
                <T.Black style={{ fontSize: 13, color: colors.accent }}>Cambiar</T.Black>
              </Pressable>
            </View>
          ) : (
            <>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar: concentrado, pollo, arroz…"
                placeholderTextColor={colors.textMuted}
                style={[s.input, { borderRadius: radius.pill }]}
              />
              {results.map((x, i) => (
                <View key={x.id}>
                  {results[i - 1]?.group !== x.group ? <T.Muted style={s.group}>{x.group.toUpperCase()}</T.Muted> : null}
                  <Pressable onPress={() => setFoodId(x.id)} style={s.result}>
                    <View style={{ flex: 1 }}>
                      <T.Black style={{ fontSize: 15 }}>{x.name}</T.Black>
                      <T.Muted style={{ fontSize: 12 }}>{x.kcal ? `${x.kcal} kcal por 100 g` : 'Sin tabla nutricional'}</T.Muted>
                    </View>
                    <T.Black style={{ fontSize: 14, color: colors.accent }}>Usar</T.Black>
                  </Pressable>
                </View>
              ))}
              {results.length === 0 ? <T.Muted style={{ fontSize: 13 }}>No está en la lista.</T.Muted> : null}
              <Pressable onPress={() => router.push({ pathname: '/ficha', params: { tipo: 'alimento' } })} style={s.small}>
                <T.Black style={{ fontSize: 14, color: colors.accent }}>+ Registrar su alimento con foto del empaque</T.Black>
              </Pressable>
            </>
          )}
        </Card>

        <Card style={{ gap: 10 }}>
          <Input field={{ key: 'g', label: 'Cantidad en gramos', placeholder: '150', number: true, required: true }} value={grams} onChange={setGrams} />
          <Chips options={GRAMS} value={GRAMS.some((x) => x.id === grams) ? grams : undefined} onChange={setGrams} />
          <T.Muted style={{ fontSize: 12 }}>Una taza medidora llena suele tener unos 100 g de concentrado. Lo más exacto es pesarlo.</T.Muted>
        </Card>

        {n && food ? (
          <Card style={{ gap: 2, backgroundColor: colors.lilacSoft }}>
            <T.Black>Lo que aporta esta comida</T.Black>
            {[
              ['Energía', `${n.kcal} kcal`],
              ['Proteína', `${n.proteina} g`],
              ['Grasa', `${n.grasa} g`],
              ['Fibra', `${n.fibra} g`],
            ].map(([k, v]) => (
              <View key={k} style={s.row}>
                <T.Muted style={{ flex: 1 }}>{k}</T.Muted>
                <T.Black>{v}</T.Black>
              </View>
            ))}
            <T.Muted style={{ fontSize: 12, marginTop: 6 }}>Fuente: {food.source}.</T.Muted>
          </Card>
        ) : null}

        <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />
        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: 'Se lo comió todo, dejó la mitad…', multiline: true }} value={note} onChange={setNote} />
        <Button label={editing ? 'Guardar cambios' : 'Guardar comida'} kind="solid" disabled={!valid} onPress={save} />
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
  group: { fontSize: 11, marginTop: 6, letterSpacing: 1 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grey },
  picked: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.blue },
  small: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#FFFFFF' },
});
