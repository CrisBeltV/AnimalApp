import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetDrawing } from '../components/PetDrawing';
import { Button, T } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { Species } from '../lib/types';

// Bienvenida: el dueño y su mascota.
export default function CrearMascota() {
  const { createPet } = useStore();
  const insets = useSafeAreaInsets();
  const [owner, setOwner] = useState('');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('perro');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const dateOk = birthDate === '' || /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

  function save() {
    createPet(owner.trim(), {
      name: name.trim(),
      species,
      breed: breed.trim(),
      birthDate: birthDate || undefined,
    });
    router.replace('/');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[s.page, { paddingTop: insets.top + 20 }]} keyboardShouldPersistTaps="handled">
      <View style={s.hero}>
        <View style={s.ground} />
        <PetDrawing species={species} mood="feliz" size={130} />
      </View>
      <T.Display style={{ fontSize: 32, color: colors.accent }}>Animaapp</T.Display>
      <T.Body style={{ fontSize: 16, color: colors.textMuted }}>Cuéntanos de ti y de tu mascota para empezar a cuidarla juntos.</T.Body>

      <T.Black style={s.label}>Tu nombre</T.Black>
      <TextInput value={owner} onChangeText={setOwner} placeholder="Camila" placeholderTextColor={colors.textMuted} style={s.input} />

      <T.Black style={s.label}>¿Es perro o gato?</T.Black>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['perro', 'gato'] as Species[]).map((sp) => (
          <Pressable key={sp} onPress={() => setSpecies(sp)} style={[s.choice, species === sp && s.choiceActive]}>
            <PetDrawing species={sp} mood="feliz" size={56} />
            <T.Black>{sp === 'perro' ? 'Perro' : 'Gato'}</T.Black>
          </Pressable>
        ))}
      </View>

      <T.Black style={s.label}>Nombre de tu mascota</T.Black>
      <TextInput value={name} onChangeText={setName} placeholder="Mara" placeholderTextColor={colors.textMuted} style={s.input} />

      <T.Black style={s.label}>Raza (opcional)</T.Black>
      <TextInput value={breed} onChangeText={setBreed} placeholder="Criollo" placeholderTextColor={colors.textMuted} style={s.input} />

      <T.Black style={s.label}>Fecha de nacimiento (opcional)</T.Black>
      <TextInput
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={colors.textMuted}
        style={[s.input, !dateOk && { borderColor: colors.bad }]}
      />
      {!dateOk && <T.Bold style={{ color: colors.bad }}>Escríbela así: 2021-05-30</T.Bold>}

      <Button label="Empezar" kind="solid" style={{ marginTop: 20 }} onPress={save} disabled={!owner.trim() || !name.trim() || !dateOk} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingBottom: 40, gap: 6, width: '100%', maxWidth: 560, alignSelf: 'center' },
  hero: { height: 150, borderRadius: 26, backgroundColor: colors.blueTint, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 },
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, backgroundColor: '#9CCB8A', borderTopLeftRadius: 200, borderTopRightRadius: 200 },
  label: { marginTop: 12 },
  choice: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.grey,
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
