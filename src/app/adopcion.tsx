import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Check, Chips, PhotoSet } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { spotFor } from '../lib/barrio';
import { KINDS, SIZES } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { AdoptionInfo, Species } from '../lib/types';

// Buscarle un hogar: dar en adopción (sin costo) o pedir un hogar temporal.
export default function Adopcion() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const { addReport } = useStore();
  const [kind, setKind] = useState<'adopcion' | 'hogar'>(tipo === 'hogar' ? 'hogar' : 'adopcion');
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('perro');
  const [age, setAge] = useState('');
  const [size, setSize] = useState<string>('');
  const [time, setTime] = useState('');
  const [checks, setChecks] = useState({ vacunada: false, esterilizada: false, desparasitada: false });
  const [note, setNote] = useState('');
  const [place, setPlace] = useState('');
  const [here] = useState(() => spotFor(`${Date.now()}`, 600));
  const tint = KINDS[kind];

  function publish() {
    const adoption: AdoptionInfo = { age: age.trim() || undefined, size: (size || undefined) as AdoptionInfo['size'], time: time.trim() || undefined, ...checks };
    const id = addReport({
      kind,
      at: Date.now(),
      petName: name.trim(),
      title: kind === 'adopcion' ? `${name.trim()} busca familia` : `${name.trim()} busca hogar temporal`,
      species,
      description: note.trim() || (kind === 'adopcion' ? 'Busca una familia responsable.' : 'Necesita un hogar temporal.'),
      adoption,
      place: place.trim() || 'Engativá',
      photos: photos.filter(Boolean),
      ...here,
    });
    router.replace({ pathname: '/reporte', params: { id, nuevo: '1' } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Buscarle un hogar" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.tabs} accessibilityRole="tablist">
          {(['adopcion', 'hogar'] as const).map((k) => (
            <Pressable
              key={k}
              accessibilityRole="tab"
              accessibilityState={{ selected: kind === k }}
              onPress={() => setKind(k)}
              style={[s.tab, kind === k && { backgroundColor: KINDS[k].pin }]}
            >
              <T.Black style={{ fontSize: 15, color: kind === k ? '#FFFFFF' : colors.text }}>{k === 'adopcion' ? 'Dar en adopción' : 'Hogar temporal'}</T.Black>
            </Pressable>
          ))}
        </View>

        <T.Black>Fotos</T.Black>
        <PhotoSet photos={photos} onChange={setPhotos} sides={['Foto 1', 'Foto 2', 'Foto 3']} />

        <T.Black>Nombre</T.Black>
        <TextInput value={name} onChangeText={setName} placeholder="Canela" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Nombre" />

        <T.Black>Especie</T.Black>
        <Chips
          options={[
            { id: 'perro', label: 'Perro' },
            { id: 'gato', label: 'Gato' },
          ]}
          value={species}
          onChange={(v) => setSpecies(v as Species)}
        />

        <T.Black>Edad</T.Black>
        <TextInput value={age} onChangeText={setAge} placeholder="2 años" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Edad" />

        <T.Black>Tamaño</T.Black>
        <Chips options={SIZES.map((x) => ({ id: x.id, label: x.label }))} value={size} onChange={setSize} />

        {kind === 'hogar' ? (
          <>
            <T.Black>¿Por cuánto tiempo?</T.Black>
            <TextInput value={time} onChangeText={setTime} placeholder="3 semanas" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Por cuánto tiempo" />
          </>
        ) : null}

        <View style={{ gap: 8 }}>
          {(['vacunada', 'esterilizada', 'desparasitada'] as const).map((k) => (
            <Check key={k} label={k[0].toUpperCase() + k.slice(1)} on={checks[k]} onPress={() => setChecks({ ...checks, [k]: !checks[k] })} />
          ))}
        </View>

        <T.Black>Barrio</T.Black>
        <TextInput value={place} onChangeText={setPlace} placeholder="Villa Luz" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Barrio" />

        <T.Black>Cuéntanos de {name.trim() || 'ella'}</T.Black>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Muy cariñosa con niños, se lleva bien con gatos. Rescatada en Villa Luz."
          placeholderTextColor={colors.textMuted}
          style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
          multiline
        />

        <Card style={{ backgroundColor: tint.bg }}>
          <T.Body style={{ color: tint.text, fontSize: 14 }}>
            <T.Black style={{ color: tint.text, fontSize: 14 }}>Adopción sin costo:</T.Black> en Animaapp no se venden mascotas. Recomendamos visita previa y seguimiento.
          </T.Body>
        </Card>
        <Button label="Publicar" kind="solid" disabled={!name.trim()} onPress={publish} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 24, padding: 4 },
  tab: { flex: 1, height: 44, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
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
});
