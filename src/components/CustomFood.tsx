import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { CATS } from '../lib/ingredients';
import type { CatId, Ingredient } from '../lib/ingredients';
import { colors, fonts, radius } from '../lib/theme';
import { Chips } from './form';
import { Button, T } from './ui';
import { TextInput } from './Text';

const KINDS = [
  { id: 'alimento', label: 'Alimento' },
  { id: 'suplemento', label: 'Suplemento' },
  { id: 'otro', label: 'Otro' },
];

const BASES = [
  { id: '100', label: 'Por 100 g' },
  { id: 'porcion', label: 'Por porción' },
];

// Lo que trae la etiqueta. Los minerales van en miligramos.
const FIELDS: { key: keyof Ingredient; label: string; unit: string }[] = [
  { key: 'kcal', label: 'Calorías', unit: 'kcal' },
  { key: 'proteina', label: 'Proteína', unit: 'g' },
  { key: 'grasa', label: 'Grasa', unit: 'g' },
  { key: 'carbos', label: 'Carbohidratos', unit: 'g' },
  { key: 'fibra', label: 'Fibra', unit: 'g' },
  { key: 'calcio', label: 'Calcio', unit: 'mg' },
  { key: 'fosforo', label: 'Fósforo', unit: 'mg' },
  { key: 'hierro', label: 'Hierro', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'sodio', label: 'Sodio', unit: 'mg' },
  { key: 'potasio', label: 'Potasio', unit: 'mg' },
];

const num = (t: string) => {
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Agregar un alimento, suplemento u otra cosa que no está en la lista, con los valores de su etiqueta.
// Queda guardado para los próximos platos y entra al plato y a la tabla de aportes.
export function CustomFood({ visible, startCat, onClose, onSave }: { visible: boolean; startCat: CatId; onClose: () => void; onSave: (ing: Ingredient) => void }) {
  const [kind, setKind] = useState('alimento');
  const [cat, setCat] = useState<CatId>(startCat);
  const [name, setName] = useState('');
  const [base, setBase] = useState('100');
  const [portion, setPortion] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  const factor = base === '100' ? 1 : num(portion) > 0 ? 100 / num(portion) : 0;
  const valid = name.trim().length > 0 && factor > 0;

  const reset = () => {
    setKind('alimento');
    setName('');
    setBase('100');
    setPortion('');
    setValues({});
  };
  const save = () => {
    const per100 = (k: string) => Math.round(num(values[k] ?? '') * factor * 10) / 10;
    const finalCat: CatId = kind === 'alimento' ? cat : 'extras';
    const ing = {
      id: `mio-${Date.now()}`,
      name: name.trim(),
      icon: kind === 'suplemento' ? '💊' : kind === 'otro' ? '🥄' : (CATS.find((c) => c.id === finalCat)?.icon ?? '🍽️'),
      cat: finalCat,
      ...Object.fromEntries(FIELDS.map((f) => [f.key, per100(f.key)])),
    } as Ingredient;
    onSave(ing);
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <ScrollView contentContainerStyle={{ gap: 10, padding: 18 }} keyboardShouldPersistTaps="handled">
            <T.Display style={{ fontSize: 20 }}>Agregar otro alimento</T.Display>
            <Chips options={KINDS} value={kind} onChange={setKind} />
            {kind === 'alimento' ? (
              <>
                <T.Black>Categoría</T.Black>
                <Chips options={CATS.map((c) => ({ id: c.id, label: c.label }))} value={cat} onChange={(v) => setCat(v as CatId)} />
              </>
            ) : null}
            <TextInput
              accessibilityLabel="Nombre del alimento"
              value={name}
              onChangeText={setName}
              placeholder={kind === 'suplemento' ? 'Omega 3, calcio, probiótico…' : 'Nombre'}
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
            <T.Black>Lo que dice la etiqueta</T.Black>
            <Chips options={BASES} value={base} onChange={setBase} />
            {base === 'porcion' ? (
              <View style={s.row}>
                <T.Bold style={{ flex: 1 }}>Una porción pesa</T.Bold>
                <TextInput accessibilityLabel="Gramos de la porción" value={portion} onChangeText={setPortion} keyboardType="decimal-pad" placeholder="5" placeholderTextColor={colors.textMuted} style={s.small} />
                <T.Black>g</T.Black>
              </View>
            ) : null}
            {FIELDS.map((f) => (
              <View key={f.key} style={s.row}>
                <T.Bold style={{ flex: 1 }}>{f.label}</T.Bold>
                <TextInput
                  accessibilityLabel={f.label}
                  value={values[f.key] ?? ''}
                  onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t.replace(/[^0-9.,]/g, '') }))}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  style={s.small}
                />
                <T.Muted style={{ width: 34 }}>{f.unit}</T.Muted>
              </View>
            ))}
            <T.Muted style={{ fontSize: 12 }}>Lo que no sepas déjalo en 0. Queda guardado para tus próximos platos.</T.Muted>
            <Button label="Agregar al plato" kind="solid" disabled={!valid} onPress={save} />
            <Button label="Cancelar" kind="secondary" onPress={() => (reset(), onClose())} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 440, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: radius.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { minHeight: 46, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.grey, paddingHorizontal: 14, fontSize: 16, fontFamily: fonts.body, color: colors.body },
  small: { width: 84, height: 40, borderRadius: 12, borderWidth: 1.5, borderColor: colors.grey, textAlign: 'center', fontSize: 15, fontFamily: fonts.bodyBold, color: colors.text },
});
