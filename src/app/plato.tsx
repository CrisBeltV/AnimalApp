import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { Chips } from '../components/form';
import { CustomFood } from '../components/CustomFood';
import { BackHeader, Button, Card, T } from '../components/ui';
import { dishBalance, dishNutrition, WEEK } from '../lib/dishes';
import { CATS, FORBIDDEN, allIngredients } from '../lib/ingredients';
import type { CatId, Ingredient } from '../lib/ingredients';
import { serveDish } from '../lib/foods';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import { Text, TextInput } from '../components/Text';
import { tr, useLang, useWeek } from '../lib/i18n';

const FIRST_GRAMS: Record<CatId, number> = { proteinas: 100, cereales: 80, verduras: 40, frutas: 20, extras: 10, concentrados: 100 };
const PLANS = [
  { id: 'diario', label: 'Alimento diario' },
  { id: 'dias', label: 'Algunos días' },
  { id: 'nunca', label: 'Cuando lo elija' },
];

const r1 = (n: number) => Math.round(n * 10) / 10;

// Preparar un plato: se eligen ingredientes, se ajustan los gramos y el plato muestra su balance al momento.
export default function Plato() {
  const week = useWeek();
  const lang = useLang();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, saveDish, removeDish, addEntry, saveIngredient } = useStore();
  const pet = data.pet!;
  const editing = (data.dishes ?? []).find((d) => d.id === id);
  const list = allIngredients(data.entries, data.myIngredients);
  const [items, setItems] = useState(editing?.items ?? []);
  const [cat, setCat] = useState<CatId>('proteinas');
  const [name, setName] = useState(editing?.name ?? '');
  const [plan, setPlan] = useState(() => {
    const n = editing?.days?.length ?? 0;
    return n === 7 ? 'diario' : n > 0 ? 'dias' : editing ? 'nunca' : 'diario';
  });
  const [days, setDays] = useState<number[]>(editing?.days && editing.days.length < 7 ? editing.days : []);
  const [warn, setWarn] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  // +: la lista ampliada de la categoría, con buscador por nombre.
  const [moreOpen, setMoreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState(false);
  // Nunca en el plato: 3 distintos cada vez que se abre la ventana.
  const [forbidden] = useState(() => [...FORBIDDEN].sort(() => Math.random() - 0.5).slice(0, 3));

  const n = dishNutrition(items, list);
  const balance = dishBalance(n, pet.species, pet.name);
  const shown = list.filter((x) => x.cat === cat && (!x.more || items.some((it) => it.id === x.id)));
  const q = query.trim().toLowerCase();
  const moreList = list.filter((x) => x.cat === cat && x.more && (!q || x.name.toLowerCase().includes(q) || tr(x.name, lang).toLowerCase().includes(q)));
  const inBowl = items.map((it) => ({ ...it, ing: list.find((x) => x.id === it.id) }));

  // Se suma y se resta de 5 en 5 gramos; por debajo de 20 g, de 1 en 1.
  const STEP = 5;
  const add = (ing: Ingredient) =>
    setItems((l) => (l.some((x) => x.id === ing.id) ? l.map((x) => (x.id === ing.id ? { ...x, g: x.g + (x.g < 20 ? 1 : STEP) } : x)) : [...l, { id: ing.id, g: ing.step ? STEP : FIRST_GRAMS[ing.cat] }]));
  const changeG = (iid: string, delta: number) => setItems((l) => l.map((x) => (x.id === iid ? { ...x, g: Math.max(0, x.g + delta) } : x)).filter((x) => x.g > 0));
  const setG = (iid: string, g: number) => setItems((l) => l.map((x) => (x.id === iid ? { ...x, g } : x)));
  const less = (g: number) => (g <= 20 ? 1 : 5);
  const more = (g: number) => (g < 20 ? 1 : 5);

  const planDays = plan === 'diario' ? [0, 1, 2, 3, 4, 5, 6] : plan === 'dias' ? days : [];
  const valid = items.length > 0 && name.trim() && (plan !== 'dias' || days.length > 0);
  const save = () => {
    saveDish({ id: editing?.id, name: name.trim(), items, days: planDays });
    router.back();
  };

  const saveCustom = (ing: Ingredient) => {
    saveIngredient(ing);
    setItems((l) => [...l, { id: ing.id, g: ing.cat === 'extras' ? STEP : FIRST_GRAMS[ing.cat] }]);
    setCat(ing.cat);
    setCustom(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <CustomFood visible={custom} startCat={cat} onClose={() => setCustom(false)} onSave={saveCustom} />
      <BackHeader title={editing ? 'Editar plato' : 'Preparar plato nuevo'} subtitle={`Para ${pet.name}`} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <Bowl icons={inBowl.map((x) => x.ing?.icon ?? '🍽️')} />
          <T.Display style={{ fontSize: 22 }}>{balance.title}</T.Display>
          <View style={{ flexDirection: 'row', gap: 4 }} accessibilityLabel={`Equilibrio: ${balance.stars} de 5 huellas`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Text key={i} style={{ fontSize: 24, opacity: i < balance.stars ? 1 : 0.18 }}>
                🐾
              </Text>
            ))}
          </View>
          <T.Muted>
            {Math.round(n.grams)} g · {Math.round(n.kcal)} kcal
          </T.Muted>
        </Card>

        <View style={{ gap: 8 }}>
          <T.Black>Elige los ingredientes</T.Black>
          {/* Todas las categorías a la vista, sin deslizar: Extras queda junto a Frutas. */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATS.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: cat === c.id }}
                onPress={() => (setCat(c.id), setQuery(''))}
                style={[s.cat, cat === c.id && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              >
                <Text style={[s.catText, cat === c.id && { color: '#FFFFFF' }]}>
                  {c.icon} {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={s.grid}>
            {shown.map((ing) => {
              const avoid = pet.species === 'gato' && ing.noCat;
              const count = items.find((x) => x.id === ing.id)?.g;
              return (
                <Pressable
                  key={ing.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Añadir ${ing.name}`}
                  disabled={avoid}
                  onPress={() => add(ing)}
                  style={[s.tile, count ? { borderColor: colors.accent, backgroundColor: colors.blue } : null, avoid && { opacity: 0.4 }]}
                >
                  <Text style={{ fontSize: 30 }}>{ing.icon}</Text>
                  <Text style={s.tileName} numberOfLines={2}>
                    {ing.name}
                  </Text>
                  <Text style={s.tileSub}>{avoid ? 'Mejor no para gatos' : count ? `${count} g` : `${Math.round(ing.kcal)} kcal/100 g`}</Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Más alimentos"
              accessibilityState={{ expanded: moreOpen }}
              onPress={() => setMoreOpen(!moreOpen)}
              style={[s.tile, s.plusTile, moreOpen && { backgroundColor: colors.accent, borderColor: colors.accent }]}
            >
              <Text style={[s.plus, moreOpen && { color: '#FFFFFF' }]}>{moreOpen ? '−' : '+'}</Text>
              <Text style={[s.tileName, moreOpen && { color: '#FFFFFF' }]}>{moreOpen ? 'Cerrar lista' : 'Más alimentos'}</Text>
            </Pressable>
          </View>
          {moreOpen ? (
            <Card style={{ gap: 6 }}>
              <TextInput
                accessibilityLabel="Buscar alimento"
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre…"
                placeholderTextColor={colors.textMuted}
                style={s.search}
              />
              {moreList.length === 0 ? <T.Muted style={{ fontSize: 13 }}>No hay alimentos con ese nombre.</T.Muted> : null}
              {moreList.map((ing) => {
                const avoid = pet.species === 'gato' && ing.noCat;
                const count = items.find((x) => x.id === ing.id)?.g;
                return (
                  <Pressable
                    key={ing.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Añadir ${ing.name}`}
                    disabled={avoid}
                    onPress={() => add(ing)}
                    style={[s.moreRow, avoid && { opacity: 0.4 }]}
                  >
                    <Text style={{ fontSize: 22 }}>{ing.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <T.Bold style={{ fontSize: 14 }}>{ing.name}</T.Bold>
                      <T.Muted style={{ fontSize: 12 }}>{avoid ? 'Mejor no para gatos' : `${Math.round(ing.kcal)} kcal/100 g`}</T.Muted>
                    </View>
                    <T.Black style={{ fontSize: 13, color: colors.accent }}>{count ? `${count} g` : '+ Añadir'}</T.Black>
                  </Pressable>
                );
              })}
            </Card>
          ) : null}
          <Button label="＋ Agregar otro alimento o suplemento" onPress={() => setCustom(true)} />
        </View>

        <Card style={{ gap: 8 }}>
          <T.Black>En el plato</T.Black>
          {inBowl.length === 0 ? <T.Muted style={{ fontSize: 14 }}>Toca un ingrediente para ponerlo en el plato.</T.Muted> : null}
          {inBowl.map((x) => (
            <View key={x.id} style={s.item}>
              <Text style={{ fontSize: 22 }}>{x.ing?.icon}</Text>
              <T.Bold style={{ flex: 1 }} numberOfLines={1}>
                {x.ing?.name ?? 'Ingrediente borrado'}
              </T.Bold>
              <Pressable accessibilityLabel={`Menos ${x.ing?.name}`} onPress={() => changeG(x.id, -less(x.g))} style={s.step}>
                <Text style={s.stepText}>−</Text>
              </Pressable>
              <GramsEdit name={x.ing?.name ?? ''} g={x.g} onSet={(g) => setG(x.id, g)} />
              <Pressable accessibilityLabel={`Más ${x.ing?.name}`} onPress={() => changeG(x.id, more(x.g))} style={s.step}>
                <Text style={s.stepText}>+</Text>
              </Pressable>
              <Pressable accessibilityLabel={`Quitar ${x.ing?.name}`} onPress={() => changeG(x.id, -x.g)} style={{ padding: 6 }}>
                <T.Black style={{ color: colors.textMuted }}>✕</T.Black>
              </Pressable>
            </View>
          ))}
        </Card>

        {items.length ? (
          <Card style={{ gap: 8 }}>
            <T.Black>Balance del plato</T.Black>
            {balance.checks.map((c) => (
              <View key={c.id} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>{c.ok ? '✅' : '⚠️'}</Text>
                <View style={{ flex: 1 }}>
                  <T.Bold>{c.label}</T.Bold>
                  {!c.ok ? <T.Muted style={{ fontSize: 13 }}>{c.tip}</T.Muted> : null}
                </View>
              </View>
            ))}
            {n.completeShare >= 0.5 ? <T.Muted style={{ fontSize: 12 }}>El concentrado ya trae sus vitaminas y minerales.</T.Muted> : null}
          </Card>
        ) : null}

        {items.length ? (
          <Card style={{ gap: 2, backgroundColor: colors.lilacSoft }}>
            <T.Black>Tabla calórica y mineral</T.Black>
            {(
              [
                ['Energía', `${Math.round(n.kcal)} kcal`],
                ['Proteína', `${r1(n.proteina)} g`],
                ['Grasa', `${r1(n.grasa)} g`],
                ['Carbohidratos', `${r1(n.carbos)} g`],
                ['Fibra', `${r1(n.fibra)} g`],
                ['Calcio', `${Math.round(n.calcio)} mg`],
                ['Fósforo', `${Math.round(n.fosforo)} mg`],
                ['Hierro', `${r1(n.hierro)} mg`],
                ['Zinc', `${r1(n.zinc)} mg`],
                ['Sodio', `${Math.round(n.sodio)} mg`],
                ['Potasio', `${Math.round(n.potasio)} mg`],
              ] as const
            ).map(([k, v]) => (
              <View key={k} style={s.tableRow}>
                <T.Muted style={{ flex: 1 }}>{k}</T.Muted>
                <T.Black>{v}</T.Black>
              </View>
            ))}
            <T.Muted style={{ fontSize: 12, marginTop: 6 }}>
              Valores típicos aproximados por 100 g cocidos y sin sal (tablas USDA). Una dieta casera completa debe revisarla tu veterinario.
            </T.Muted>
          </Card>
        ) : null}

        <Card style={{ gap: 8 }}>
          <T.Black>Nunca en el plato</T.Black>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {forbidden.map((f) => (
              <Pressable key={f.name} accessibilityRole="button" accessibilityLabel={f.name} onPress={() => setWarn(warn === f.name ? null : f.name)} style={[s.forbid, warn === f.name && { borderColor: colors.lost }]}>
                <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                <Text style={s.forbidText}>{f.name}</Text>
              </Pressable>
            ))}
          </View>
          {warn ? <T.Bold style={{ color: colors.lostText }}>🚫 {forbidden.find((f) => f.name === warn)?.why}</T.Bold> : null}
        </Card>

        <T.Black>Nombre del plato</T.Black>
        <TextInput value={name} onChangeText={setName} placeholder="Pollo con arroz y zanahoria" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Nombre del plato" />
        <T.Black>¿Cuándo lo come?</T.Black>
        <Chips options={PLANS} value={plan} onChange={setPlan} />
        {plan === 'dias' ? (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {WEEK.map((d, i) => {
              const on = days.includes(i);
              return (
                <Pressable
                  key={d}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => setDays(on ? days.filter((x) => x !== i) : [...days, i])}
                  style={[s.day, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                >
                  <Text style={[s.dayText, on && { color: '#FFFFFF' }]}>{week[i]}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <T.Muted style={{ fontSize: 12 }}>
          {plan === 'diario' ? `Será el alimento diario de ${pet.name}.` : plan === 'dias' ? 'Se sirve los días marcados.' : 'Lo eliges cuando prepares su comida.'}
        </T.Muted>

        <Button label={editing ? 'Guardar cambios' : 'Guardar plato'} kind="solid" disabled={!valid} onPress={save} />
        {editing ? (
          <>
            <Button label="Servir ahora" onPress={() => (addEntry(serveDish(editing, data.entries, data.myIngredients)), router.back())} />
            {confirm ? (
              <Card style={{ gap: 10, borderWidth: 2, borderColor: colors.lost }}>
                <T.Black>¿Borrar este plato? Las comidas que ya registraste se conservan.</T.Black>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setConfirm(false)} />
                  <Button
                    label="Sí, borrar"
                    kind="lost"
                    style={{ flex: 1 }}
                    onPress={() => {
                      removeDish(editing.id);
                      router.back();
                    }}
                  />
                </View>
              </Card>
            ) : (
              <Button label="Borrar plato" kind="lost" onPress={() => setConfirm(true)} />
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

// El plato dibujado, con los ingredientes encima.
function Bowl({ icons }: { icons: string[] }) {
  return (
    <View style={{ width: 220, height: 130, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={s.pile}>
        {icons.length === 0 ? <Text style={{ fontSize: 13, color: colors.textMuted }}>Plato vacío</Text> : null}
        {icons.slice(0, 10).map((ic, i) => (
          <Text key={i} style={{ fontSize: 30, marginHorizontal: -3, transform: [{ rotate: `${((i * 37) % 30) - 15}deg` }] }}>
            {ic}
          </Text>
        ))}
      </View>
      <Svg width={220} height={70} viewBox="0 0 220 70">
        <Ellipse cx={110} cy={14} rx={104} ry={12} fill={colors.blueOutline} />
        <Path d="M6 14 Q 20 66 110 66 Q 200 66 214 14 Z" fill={colors.accent} />
        <Path d="M30 30 Q 110 52 190 30" stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={4} fill="none" />
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  pile: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', width: 190, marginBottom: -14, zIndex: 1 },
  cat: { paddingHorizontal: 12, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: colors.blueOutline, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  catText: { fontSize: 14, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31.5%',
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    gap: 2,
  },
  tileName: { fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.text, textAlign: 'center' },
  tileSub: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center' },
  plusTile: { borderStyle: 'dashed', borderColor: colors.blueOutline, justifyContent: 'center' },
  plus: { fontSize: 30, lineHeight: 34, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.accent },
  search: { minHeight: 44, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.grey, paddingHorizontal: 14, fontSize: 15, fontFamily: fonts.body, color: colors.body },
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.grey },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: radius.md, backgroundColor: colors.blue },
  step: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, fontWeight: '700', color: colors.accent, lineHeight: 22 },
  grams: { minWidth: 52, textAlign: 'center', fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 14, color: colors.text },
  gramsBox: { minWidth: 58, height: 32, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1.5, borderColor: colors.blueOutline, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  gramsInput: { width: 64, flexGrow: 0, flexShrink: 0, height: 32, paddingHorizontal: 6, borderRadius: 10, borderWidth: 2, borderColor: colors.accent, backgroundColor: '#FFFFFF', textAlign: 'center', fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 14, color: colors.text },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#FFFFFF' },
  forbid: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.lostSoft, backgroundColor: colors.lostSoft },
  forbidText: { fontSize: 13, fontFamily: fonts.bodyBold, fontWeight: '700', color: colors.lostText, textDecorationLine: 'line-through' },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.grey,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.body,
  },
  day: { flex: 1, height: 40, borderRadius: 12, borderWidth: 1.5, borderColor: colors.blueOutline, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 14, color: colors.accent },
});

// Los gramos se pueden escribir a mano: al tocar el número aparece un campo; al terminar se guarda.
// Si queda vacío o en 0, se mantiene lo que había (para quitar el ingrediente está la ✕).
function GramsEdit({ name, g, onSet }: { name: string; g: number; onSet: (g: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const v = Math.round(parseFloat(draft.replace(',', '.')) * 10) / 10;
    if (v > 0) onSet(Math.min(v, 5000));
    setDraft(null);
  };
  if (draft !== null) {
    return (
      <TextInput
        accessibilityLabel={`Gramos de ${name}`}
        value={draft}
        onChangeText={(t) => setDraft(t.replace(/[^0-9.,]/g, '').slice(0, 6))}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="decimal-pad"
        returnKeyType="done"
        autoFocus
        selectTextOnFocus
        style={s.gramsInput}
      />
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Escribir gramos de ${name}`} onPress={() => setDraft(String(g))} style={s.gramsBox}>
      <Text style={s.grams}>{g} g</Text>
    </Pressable>
  );
}
