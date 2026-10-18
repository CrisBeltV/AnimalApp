import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BackHeader, Button, Card, T } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

export default function Ajustes() {
  const { data, setOwnerName, reset } = useStore();
  const [name, setName] = useState(data.ownerName);
  const [confirming, setConfirming] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Ajustes y privacidad" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <T.Black>Tu nombre</T.Black>
        <TextInput value={name} onChangeText={setName} style={s.input} placeholder="Camila" placeholderTextColor={colors.textMuted} />
        <Button label="Guardar nombre" disabled={!name.trim() || name.trim() === data.ownerName} onPress={() => setOwnerName(name.trim())} />

        <Card style={{ gap: 6, marginTop: 8 }}>
          <T.Black>Tus datos</T.Black>
          <T.Body>
            Por ahora todo lo que anotas se guarda solo en este teléfono. Cuando conectemos la nube, podrás entrar con tu cuenta
            desde otro teléfono y compartir el cuidado con tu familia.
          </T.Body>
        </Card>

        {confirming ? (
          <Card style={{ gap: 10, borderWidth: 2, borderColor: colors.lost }}>
            <T.Black>¿Borrar todo y empezar de cero?</T.Black>
            <T.Body>Se borran tu mascota, sus registros, logros y reportes de este teléfono.</T.Body>
            <Button
              label="Sí, borrar todo"
              kind="lost"
              onPress={() => {
                reset();
                router.replace('/crear-mascota');
              }}
            />
            <Button label="No, volver" kind="secondary" onPress={() => setConfirming(false)} />
          </Card>
        ) : (
          <Button label="Empezar de cero" kind="lost" onPress={() => setConfirming(true)} />
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
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
