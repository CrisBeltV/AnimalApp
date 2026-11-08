import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Input } from '../components/form';
import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Button, T } from '../components/ui';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { Species } from '../lib/types';
import { TextInput } from '../components/Text';

const two = (n: number) => String(n).padStart(2, '0');
const iso = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};

// Agregar una mascota nueva (?nueva=1) o editar los datos de la mascota activa.
export default function EditarMascota() {
  const { nueva } = useLocalSearchParams<{ nueva?: string }>();
  const { data, updatePet, addPet } = useStore();
  const adding = !!nueva;
  const pet = adding ? null : data.pet;
  const [name, setName] = useState(pet?.name ?? '');
  const [species, setSpecies] = useState<Species>(pet?.species ?? 'perro');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [birthDate, setBirthDate] = useState(pet?.birthDate ? formatDate(new Date(`${pet.birthDate}T12:00:00`).getTime()) : '');

  const born = parseDate(birthDate);
  const dateOk = birthDate.trim() === '' || born !== null;

  function save() {
    const values = { name: name.trim(), species, breed: breed.trim(), birthDate: born !== null ? iso(born) : undefined };
    if (adding) {
      addPet(values);
      router.dismissTo('/');
    } else {
      updatePet(values);
      router.back();
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={adding ? 'Agregar mascota' : 'Editar mascota'} subtitle={adding ? undefined : pet?.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <View style={s.ground} />
          <PetDrawing species={species} mood="feliz" size={120} />
        </View>

        <T.Black style={s.label}>¿Es perro o gato?</T.Black>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['perro', 'gato'] as Species[]).map((sp) => (
            <Pressable key={sp} accessibilityRole="radio" accessibilityState={{ checked: species === sp }} onPress={() => setSpecies(sp)} style={[s.choice, species === sp && s.choiceActive]}>
              <PetDrawing species={sp} mood="feliz" size={56} />
              <T.Black>{sp === 'perro' ? 'Perro' : 'Gato'}</T.Black>
            </Pressable>
          ))}
        </View>

        <T.Black style={s.label}>Nombre</T.Black>
        <TextInput value={name} onChangeText={setName} placeholder="Luna" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Nombre de la mascota" />

        <T.Black style={s.label}>Raza (opcional)</T.Black>
        <TextInput value={breed} onChangeText={setBreed} placeholder="Criollo" placeholderTextColor={colors.textMuted} style={s.input} accessibilityLabel="Raza" />

        <View style={{ marginTop: 8 }}>
          <Input field={{ key: 'nacimiento', label: 'Fecha de nacimiento (opcional)', placeholder: 'DD/MM/AAAA', date: true }} value={birthDate} onChange={setBirthDate} />
        </View>

        {adding ? (
          <T.Muted style={{ fontSize: 13 }}>
            {name.trim() || 'La nueva mascota'} empieza con sus propios registros. {data.pet?.name} conserva los suyos; cambias entre ellas desde Mi perfil.
          </T.Muted>
        ) : null}
        <Button label={adding ? 'Agregar mascota' : 'Guardar cambios'} kind="solid" style={{ marginTop: 12 }} onPress={save} disabled={!name.trim() || !dateOk} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 6, width: '100%', maxWidth: 560, alignSelf: 'center' },
  hero: { height: 140, borderRadius: 26, backgroundColor: colors.blueTint, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6 },
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, backgroundColor: '#9CCB8A', borderTopLeftRadius: 200, borderTopRightRadius: 200 },
  label: { marginTop: 12 },
  choice: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.grey },
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
