import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text as RNText, ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader, Button, Card, T } from '../components/ui';
import { LANGS } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import type { SyncState } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import { TextInput } from '../components/Text';

export default function Ajustes() {
  const { data, setOwnerName, reset, sync, clearLocal, setLanguage } = useStore();
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
          <T.Black>Idioma</T.Black>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {LANGS.map((l) => {
              const on = (data.language ?? 'es') === l.id;
              return (
                <Pressable
                  key={l.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={l.label}
                  onPress={() => setLanguage(l.id)}
                  style={[s.lang, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                >
                  <RNText style={[s.langText, on && { color: '#FFFFFF' }]}>{l.label}</RNText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ gap: 8 }}>
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
          ) : auth.signedIn ? (
            <>
              <T.Body>Entraste como {auth.email}.</T.Body>
              <T.Muted>Por ahora tu cuenta y tus datos se guardan solo en este teléfono.</T.Muted>
              <Button
                label="Cerrar sesión"
                kind="secondary"
                onPress={async () => {
                  await auth.signOut();
                  router.replace('/entrar');
                }}
              />
            </>
          ) : (
            <>
              <T.Body>
                {auth.enabled
                  ? 'Lo que anotas se guarda solo en este teléfono. Con una cuenta queda también en la nube y no lo pierdes si cambias de teléfono.'
                  : 'Lo que anotas se guarda solo en este teléfono. Con una cuenta tu mascota queda a tu nombre.'}
              </T.Body>
              <Button label="Entrar o crear cuenta" kind="solid" onPress={() => router.push('/entrar')} />
            </>
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
  lang: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.blueOutline, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  langText: { fontFamily: fonts.bodyBlack, fontWeight: '800', fontSize: 15, color: colors.accent },
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
