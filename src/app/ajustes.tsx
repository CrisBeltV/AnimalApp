import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BackHeader, Button, Card, T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import type { SyncState } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

export default function Ajustes() {
  const { data, setOwnerName, reset, sync, clearLocal } = useStore();
  const auth = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [name, setName] = useState(data.ownerName);
  const [confirming, setConfirming] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Ajustes y privacidad" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <T.Black>Tu nombre</T.Black>
        <TextInput value={name} onChangeText={setName} style={s.input} placeholder="Camila" placeholderTextColor={colors.textMuted} />
        <Button label="Guardar nombre" disabled={!name.trim() || name.trim() === data.ownerName} onPress={() => setOwnerName(name.trim())} />

        <Card style={{ gap: 8, marginTop: 8 }}>
          <T.Black>Tu cuenta y tus datos</T.Black>
          {auth.session ? (
            <>
              <T.Body>Entraste como {auth.email}.</T.Body>
              <T.Muted>{SYNC_TEXT[sync]}</T.Muted>
              {leaving ? (
                <>
                  <T.Body>Tus datos siguen en la nube. Se borran de este teléfono hasta que vuelvas a entrar.</T.Body>
                  <Button
                    label="Sí, cerrar sesión"
                    kind="secondary"
                    onPress={async () => {
                      await auth.signOut();
                      clearLocal();
                      router.replace('/entrar');
                    }}
                  />
                  <Button label="No, volver" kind="secondary" onPress={() => setLeaving(false)} />
                </>
              ) : (
                <Button label="Cerrar sesión" kind="secondary" onPress={() => setLeaving(true)} />
              )}
            </>
          ) : auth.enabled ? (
            <>
              <T.Body>Lo que anotas se guarda solo en este teléfono. Con una cuenta queda también en la nube y no lo pierdes si cambias de teléfono.</T.Body>
              <Button label="Entrar o crear cuenta" kind="solid" onPress={() => router.push('/entrar')} />
            </>
          ) : (
            <T.Body>Por ahora todo lo que anotas se guarda solo en este teléfono.</T.Body>
          )}
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

const SYNC_TEXT: Record<SyncState, string> = {
  local: 'Guardado en este teléfono.',
  sincronizando: 'Guardando en la nube…',
  'al-dia': 'Todo guardado en la nube.',
  'sin-conexion': 'Sin conexión: se guardará en la nube cuando vuelva el internet.',
};

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
