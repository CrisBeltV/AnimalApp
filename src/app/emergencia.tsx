import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PhotoSet } from '../components/form';
import { BackHeader, Button, Card, T, soon } from '../components/ui';
import { spotFor } from '../lib/barrio';
import { KINDS, SITUATIONS } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { Species } from '../lib/types';

const tint = KINDS.emergencia;

// Veterinarias 24 h de ejemplo, hasta tener aliados registrados.
const EXAMPLE_VETS = [
  { name: 'Veterinaria 24 h Villa Luz', detail: 'a 700 m · abierta ahora' },
  { name: 'Clínica veterinaria Álamos', detail: 'a 1,2 km · urgencias' },
];

// Emergencia: un animal herido, atropellado o en peligro.
export default function Emergencia() {
  const { data, addReport } = useStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [species, setSpecies] = useState<Species>('perro');
  const [what, setWhat] = useState<string[]>([]);
  const [useMine, setUseMine] = useState(true);
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [stay, setStay] = useState<boolean | null>(null);
  const [here] = useState(() => spotFor(`${Date.now()}`, 350));

  const vets = data.vets.filter((v) => v.phone).slice(0, 3);
  const label = SITUATIONS.find((x) => x.id === what[0])?.label.toLowerCase();
  const animal = species === 'gato' ? 'Gato' : 'Perro';
  const finalPlace = place.trim() || (useMine ? 'Cerca de mi ubicación actual' : '');

  function publish() {
    const id = addReport({
      kind: 'emergencia',
      at: Date.now(),
      petName: `${animal} ${label ?? 'en peligro'}`,
      title: `${animal} ${label ?? 'en peligro'}`,
      species,
      description: note.trim() || 'Necesita ayuda urgente.',
      situations: what,
      withMe: stay ?? undefined,
      place: finalPlace,
      photos: photos.filter(Boolean),
      ...here,
    });
    router.replace({ pathname: '/reporte', params: { id, nuevo: '1' } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Emergencia" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ backgroundColor: tint.bg, gap: 4 }}>
          <T.Black style={{ color: tint.text }}>⚠ Si su vida corre peligro, llama primero a una veterinaria 24 h.</T.Black>
          <T.Muted style={{ fontSize: 13, color: tint.text }}>Después publica para que los vecinos ayuden.</T.Muted>
        </Card>

        <T.Black>Fotos</T.Black>
        <PhotoSet photos={photos} onChange={setPhotos} sides={['Foto 1', 'Foto 2']} />

        <T.Black>¿Es perro o gato?</T.Black>
        <View style={s.row}>
          {(['perro', 'gato'] as Species[]).map((sp) => (
            <Pressable key={sp} accessibilityRole="radio" accessibilityState={{ checked: species === sp }} onPress={() => setSpecies(sp)} style={[s.choice, species === sp && s.on]}>
              <T.Black>{sp === 'perro' ? 'Perro' : 'Gato'}</T.Black>
            </Pressable>
          ))}
        </View>

        <T.Black>¿Qué está pasando?</T.Black>
        <T.Muted style={{ fontSize: 13 }}>Puedes elegir varias</T.Muted>
        <View style={s.grid}>
          {SITUATIONS.map((x) => {
            const on = what.includes(x.id);
            return (
              <Pressable
                key={x.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => setWhat(on ? what.filter((y) => y !== x.id) : [...what, x.id])}
                style={[s.situation, on && { backgroundColor: tint.bg, borderColor: tint.pin }]}
              >
                <T.Black style={{ fontSize: 15, color: on ? tint.text : colors.text }}>
                  {on ? '✓ ' : ''}
                  {x.label}
                </T.Black>
              </Pressable>
            );
          })}
        </View>

        <T.Black>¿Dónde está?</T.Black>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: useMine }}
          onPress={() => setUseMine(!useMine)}
          style={[s.location, useMine && { borderColor: colors.accent, backgroundColor: colors.blue }]}
        >
          <T.Black style={{ fontSize: 18 }}>📍</T.Black>
          <View style={{ flex: 1 }}>
            <T.Black>Usar mi ubicación actual</T.Black>
            <T.Muted style={{ fontSize: 12 }}>Aproximada hasta tener GPS</T.Muted>
          </View>
          <T.Black style={{ color: colors.accent }}>{useMine ? '✓' : ''}</T.Black>
        </Pressable>
        <TextInput
          value={place}
          onChangeText={setPlace}
          placeholder="Cra. 114 con Calle 80 · Los Álamos"
          placeholderTextColor={colors.textMuted}
          style={s.input}
          accessibilityLabel="Dirección o referencia"
        />

        <T.Black>Cuéntanos qué ves</T.Black>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Cojea de una pata y no deja que lo toquen."
          placeholderTextColor={colors.textMuted}
          style={[s.input, { minHeight: 70, textAlignVertical: 'top', paddingTop: 12 }]}
          multiline
        />

        <T.Black>¿Te quedas con él mientras llega ayuda?</T.Black>
        <View style={s.row}>
          {[true, false].map((v) => (
            <Pressable key={String(v)} accessibilityRole="radio" accessibilityState={{ checked: stay === v }} onPress={() => setStay(v)} style={[s.choice, stay === v && s.on]}>
              <T.Black>{v ? 'Sí' : 'No'}</T.Black>
            </Pressable>
          ))}
        </View>

        <T.Eyebrow>VETERINARIAS 24 H CERCA</T.Eyebrow>
        <Card style={{ gap: 4, paddingVertical: 8 }}>
          {(vets.length ? vets.map((v) => ({ name: v.name, detail: v.place ?? v.address ?? 'Tu veterinaria', phone: v.phone })) : EXAMPLE_VETS).map((v) => (
            <View key={v.name} style={s.vet}>
              <View style={{ flex: 1 }}>
                <T.Black style={{ fontSize: 15 }}>{v.name}</T.Black>
                <T.Muted style={{ fontSize: 12 }}>{v.detail}</T.Muted>
              </View>
              <Pressable
                accessibilityLabel={`Llamar a ${v.name}`}
                onPress={() =>
                  'phone' in v && v.phone
                    ? Linking.openURL(`tel:${v.phone}`).catch(() => {})
                    : soon('Llamar', 'Esta veterinaria es de ejemplo. Cuando guardes tu veterinaria con teléfono, el botón la llamará.')
                }
                style={s.call}
              >
                <T.Black style={{ color: '#FFFFFF', fontSize: 14 }}>Llamar</T.Black>
              </Pressable>
            </View>
          ))}
          {!vets.length ? <T.Muted style={{ fontSize: 12 }}>Ejemplos. Guarda tu veterinaria con teléfono en Salud para verla aquí.</T.Muted> : null}
        </Card>

        <Button label="Publicar emergencia" kind="solid" disabled={!what.length || !finalPlace} onPress={publish} />
        {!what.length ? <T.Muted style={{ fontSize: 12, textAlign: 'center' }}>Elige qué está pasando para publicar.</T.Muted> : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  choice: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: colors.blue, borderColor: colors.blueOutline },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  situation: {
    width: '48%',
    flexGrow: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, borderWidth: 2, borderColor: colors.grey, backgroundColor: colors.card },
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
  vet: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  call: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.found, justifyContent: 'center' },
});
