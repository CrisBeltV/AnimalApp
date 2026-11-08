import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DeleteEntry, Input, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { todaysDish } from '../lib/dishes';
import { foodStatus } from '../lib/game';
import { allFoods, forGrams } from '../lib/foods';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { useNow } from '../lib/useNow';
import { colors, fonts, radius } from '../lib/theme';
import { TextInput } from '../components/Text';

type Item = { foodId: string; grams: string };

const num = (text: string) => Number(text.replace(',', '.'));

// Registrar una comida como un menú: uno o varios alimentos, cada uno con sus gramos.
// Con la tabla nutricional de cada alimento se calcula lo que aportó la comida.
export default function Comida() {
  const params = useLocalSearchParams<{ id?: string; plato?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const f = editing?.fields ?? {};
  const foods = allFoods(data.entries, data.myIngredients);
  const now = useNow();
  const current = foodStatus(data.entries, now)?.food;
  const defaultFood = foods.find((x) => x.id === `mio:${current?.id}`) ?? foods.find((x) => x.group === 'Tus alimentos');
  const dishes = data.dishes ?? [];
  // Al preparar: el plato elegido, o el que toca hoy (diario o recurrente).
  const startDish = editing ? undefined : (dishes.find((d) => d.id === params.plato) ?? todaysDish(dishes, now));
  const [dishId, setDishId] = useState<string | undefined>(startDish?.id);

  const [items, setItems] = useState<Item[]>((): Item[] => {
    if (f.menu) {
      try {
        return (JSON.parse(f.menu) as { id: string; g: number }[]).map((x) => ({ foodId: x.id, grams: String(x.g) }));
      } catch {
        return [];
      }
    }
    if (f.alimentoId) return [{ foodId: f.alimentoId, grams: f.gramos ?? '' }];
    if (startDish) return startDish.items.map((x) => ({ foodId: x.id, grams: String(x.g) }));
    if (!editing && defaultFood) return [{ foodId: defaultFood.id, grams: current?.fields?.porcion ?? '' }];
    return [];
  });
  const [searching, setSearching] = useState(items.length === 0);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(formatDate(editing?.at ?? Date.now()));
  const [note, setNote] = useState(f.nota ?? (editing && !f.gramos ? (editing.note ?? '') : ''));

  const rows = items.map((it) => {
    const food = foods.find((x) => x.id === it.foodId);
    const g = num(it.grams);
    return { ...it, food, g, n: food && g > 0 ? forGrams(food, g) : null };
  });
  const total = rows.reduce(
    (sum, r) => (r.n ? { kcal: sum.kcal + r.n.kcal, proteina: sum.proteina + r.n.proteina, grasa: sum.grasa + r.n.grasa, fibra: sum.fibra + r.n.fibra } : sum),
    { kcal: 0, proteina: 0, grasa: 0, fibra: 0 },
  );
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const totalGrams = rows.reduce((sum, r) => sum + (r.g > 0 ? r.g : 0), 0);
  const day = parseDate(date);
  const valid = rows.length > 0 && rows.every((r) => r.food && r.g > 0) && day !== null;
  const q = query.trim().toLowerCase();
  const results = foods.filter((x) => !q || x.name.toLowerCase().includes(q) || x.group.toLowerCase().includes(q));

  const setGrams = (i: number, text: string) =>
    setItems((list) => list.map((it, k) => (k === i ? { ...it, grams: text.replace(/[^0-9.,]/g, '') } : it)));
  const pickDish = (id: string) => {
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return;
    setDishId(id);
    setItems(dish.items.map((x) => ({ foodId: x.id, grams: String(x.g) })));
    setSearching(false);
  };
  const addFood = (id: string) => {
    setItems((list) => [...list, { foodId: id, grams: '' }]);
    setSearching(false);
    setQuery('');
  };

  const save = () => {
    const menu = rows.map((r) => ({ id: r.foodId, name: r.food!.name, g: r.g, ...r.n! }));
    const fields: Record<string, string> = {
      menu: JSON.stringify(menu),
      alimentoNombre: menu.map((m) => m.name).join(' + '),
      gramos: String(r1(totalGrams)),
      kcal: String(Math.round(total.kcal)),
      proteina: String(r1(total.proteina)),
      grasa: String(r1(total.grasa)),
      fibra: String(r1(total.fibra)),
    };
    if (note.trim()) fields.nota = note.trim();
    const dish = dishes.find((d) => d.id === dishId);
    if (dish) fields.plato = dish.name;
    const sameDay = new Date(day!).toDateString() === new Date(editing?.at ?? Date.now()).toDateString();
    const at = editing && sameDay ? editing.at : new Date(day!).toDateString() === new Date().toDateString() ? Date.now() : day! + 12 * 3600000;
    const summary = menu.map((m) => `${m.g} g de ${m.name}`).join(' + ');
    const values = { fields, at, note: [summary, note.trim()].filter(Boolean).join(' · ') };
    if (editing) updateEntry(editing.id, values);
    else addEntry({ kind: 'comida', ...values });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar comida' : 'Preparar plato'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {!editing ? (
          <Card style={{ gap: 8 }}>
            <T.Black>Tus platos</T.Black>
            {dishes.length === 0 ? (
              <T.Muted style={{ fontSize: 13 }}>{'Crea platos con ingredientes en "Preparar plato" y aquí los sirves con un toque.'}</T.Muted>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {dishes.map((d) => (
                  <Pressable
                    key={d.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: dishId === d.id }}
                    onPress={() => pickDish(d.id)}
                    style={[s.dish, dishId === d.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  >
                    <T.Black style={{ fontSize: 14, color: dishId === d.id ? '#FFFFFF' : colors.accent }}>🍲 {d.name}</T.Black>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable onPress={() => router.push('/cocina')} style={s.small}>
              <T.Black style={{ fontSize: 14, color: colors.accent }}>＋ Crear un plato nuevo</T.Black>
            </Pressable>
          </Card>
        ) : null}
        <Card style={{ gap: 10 }}>
          <T.Black>
            Menú de esta comida<T.Black style={{ color: colors.lostText }}> *</T.Black>
          </T.Black>
          <T.Muted style={{ fontSize: 13 }}>Añade cada alimento que le diste y escribe sus gramos.</T.Muted>
          {rows.map((r, i) => (
            <View key={`${r.foodId}-${i}`} style={s.item}>
              <View style={{ flex: 1, gap: 2 }}>
                <T.Black style={{ fontSize: 15 }}>{r.food?.name ?? 'Alimento borrado'}</T.Black>
                <T.Muted style={{ fontSize: 12 }}>{r.n ? `${r.n.kcal} kcal · ${r.n.proteina} g proteína` : r.food ? `${r.food.kcal} kcal por 100 g` : ''}</T.Muted>
              </View>
              <TextInput
                accessibilityLabel={`Gramos de ${r.food?.name ?? 'alimento'}`}
                value={r.grams}
                onChangeText={(text) => setGrams(i, text)}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={[s.grams, !(r.g > 0) && r.grams !== '' && { borderColor: colors.lost }]}
              />
              <T.Black style={{ fontSize: 15 }}>g</T.Black>
              <Pressable accessibilityLabel={`Quitar ${r.food?.name ?? 'alimento'}`} onPress={() => setItems((l) => l.filter((_, k) => k !== i))} style={s.x}>
                <T.Black style={{ fontSize: 13, color: colors.textMuted }}>✕</T.Black>
              </Pressable>
            </View>
          ))}
          {searching ? (
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
                  <Pressable onPress={() => addFood(x.id)} style={s.result}>
                    <View style={{ flex: 1 }}>
                      <T.Black style={{ fontSize: 15 }}>{x.name}</T.Black>
                      <T.Muted style={{ fontSize: 12 }}>{x.kcal ? `${x.kcal} kcal por 100 g` : 'Sin tabla nutricional'}</T.Muted>
                    </View>
                    <T.Black style={{ fontSize: 14, color: colors.accent }}>Añadir</T.Black>
                  </Pressable>
                </View>
              ))}
              {results.length === 0 ? <T.Muted style={{ fontSize: 13 }}>No está en la lista.</T.Muted> : null}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {rows.length > 0 && (
                  <Pressable onPress={() => setSearching(false)} style={s.small}>
                    <T.Black style={{ fontSize: 14 }}>Cerrar lista</T.Black>
                  </Pressable>
                )}
                <Pressable onPress={() => router.push('/cocina')} style={s.small}>
                  <T.Black style={{ fontSize: 14, color: colors.accent }}>+ Crear plato</T.Black>
                </Pressable>
              </View>
            </>
          ) : (
            <Button label="+ Añadir otro alimento" onPress={() => setSearching(true)} />
          )}
        </Card>

        {rows.some((r) => r.n) ? (
          <Card style={{ gap: 2, backgroundColor: colors.lilacSoft }}>
            <T.Black>Lo que aporta esta comida ({r1(totalGrams)} g)</T.Black>
            {[
              ['Energía', `${Math.round(total.kcal)} kcal`],
              ['Proteína', `${r1(total.proteina)} g`],
              ['Grasa', `${r1(total.grasa)} g`],
              ['Fibra', `${r1(total.fibra)} g`],
            ].map(([k, v]) => (
              <View key={k} style={s.row}>
                <T.Muted style={{ flex: 1 }}>{k}</T.Muted>
                <T.Black>{v}</T.Black>
              </View>
            ))}
            <T.Muted style={{ fontSize: 12, marginTop: 6 }}>
              Fuente: {[...new Set(rows.filter((r) => r.food).map((r) => r.food!.source))].join('; ')}.
            </T.Muted>
          </Card>
        ) : null}

        <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />
        <Input field={{ key: 'nota', label: 'Nota (opcional)', placeholder: 'Se lo comió todo, dejó la mitad…', multiline: true }} value={note} onChange={setNote} />
        <Button label={editing ? 'Guardar cambios' : 'Servir plato'} kind="solid" disabled={!valid} onPress={save} />
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
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.blue },
  grams: {
    width: 76,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.blueOutline,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  x: { paddingHorizontal: 6, paddingVertical: 8 },
  picked: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.blue },
  dish: { paddingHorizontal: 12, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: colors.blueOutline, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  small: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#FFFFFF' },
});
