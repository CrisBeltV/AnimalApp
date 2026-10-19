import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetDrawing } from '../components/PetDrawing';
import { Button, Card, T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

type Mode = 'entrar' | 'crear' | 'recuperar';

// Entrar o crear cuenta. Con cuenta, los datos se guardan también en la nube.
export default function Entrar() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const { sync } = useStore();
  const [mode, setMode] = useState<Mode>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Cuando ya entró y se trajeron sus datos de la nube, sigue a la app.
  useEffect(() => {
    if (auth.session && (sync === 'al-dia' || sync === 'sin-conexion')) router.replace('/');
  }, [auth.session, sync]);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSend = emailOk && (mode === 'recuperar' || password.length >= 8) && !busy;

  async function send() {
    setBusy(true);
    setError('');
    setNotice('');
    if (mode === 'entrar') {
      const r = await auth.signIn(email, password);
      if (r.error) setError(r.error);
    } else if (mode === 'crear') {
      const r = await auth.signUp(email, password);
      if (r.error) setError(r.error);
      else if (r.needsConfirm) setNotice('Te enviamos un correo. Abre el enlace para confirmar tu cuenta y luego toca Entrar.');
    } else {
      const r = await auth.resetPassword(email);
      if (r.error) setError(r.error);
      else setNotice('Si ese correo tiene cuenta, te llega un enlace para crear una contraseña nueva.');
    }
    setBusy(false);
  }

  function switchTo(next: Mode) {
    setMode(next);
    setError('');
    setNotice('');
  }

  if (auth.session) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.accent} />
        <T.Muted>Trayendo tus datos de la nube…</T.Muted>
      </View>
    );
  }

  const title = mode === 'entrar' ? 'Entrar' : mode === 'crear' ? 'Crear cuenta' : 'Recuperar contraseña';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[s.page, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.hero}>
        <PetDrawing species="perro" mood="feliz" size={96} />
      </View>
      <T.Display style={{ fontSize: 30, textAlign: 'center' }}>Animaapp</T.Display>
      <T.Body style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center' }}>
        Con tu cuenta, tu mascota y sus registros quedan guardados aunque cambies de teléfono.
      </T.Body>

      {mode !== 'recuperar' ? (
        <View accessibilityRole="tablist" style={s.tabs}>
          {(['entrar', 'crear'] as Mode[]).map((m) => (
            <Pressable
              key={m}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
              onPress={() => switchTo(m)}
              style={[s.tab, mode === m && { backgroundColor: colors.blue }]}
            >
              <T.Black style={{ color: mode === m ? colors.text : colors.textMuted }}>{m === 'entrar' ? 'Entrar' : 'Crear cuenta'}</T.Black>
            </Pressable>
          ))}
        </View>
      ) : (
        <T.Display style={{ fontSize: 22 }}>{title}</T.Display>
      )}

      <T.Eyebrow>CORREO</T.Eyebrow>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        style={s.input}
      />
      {mode !== 'recuperar' ? (
        <>
          <T.Eyebrow>CONTRASEÑA</T.Eyebrow>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'crear' ? 'new-password' : 'current-password'}
            style={s.input}
          />
        </>
      ) : null}

      {error ? (
        <Card style={{ backgroundColor: colors.lostSoft }}>
          <T.Bold style={{ color: colors.lostText }}>{error}</T.Bold>
        </Card>
      ) : null}
      {notice ? (
        <Card style={{ backgroundColor: colors.foundSoft }}>
          <T.Bold style={{ color: colors.foundText }}>{notice}</T.Bold>
        </Card>
      ) : null}

      <Button label={busy ? 'Un momento…' : mode === 'recuperar' ? 'Enviar enlace' : title} kind="solid" disabled={!canSend} onPress={send} />

      {mode === 'entrar' ? (
        <Pressable onPress={() => switchTo('recuperar')} style={s.link}>
          <T.Black style={{ color: colors.accent }}>¿Olvidaste tu contraseña?</T.Black>
        </Pressable>
      ) : null}
      {mode === 'recuperar' ? (
        <Pressable onPress={() => switchTo('entrar')} style={s.link}>
          <T.Black style={{ color: colors.accent }}>Volver a entrar</T.Black>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => {
          auth.continueWithout();
          router.replace('/');
        }}
        style={s.link}
      >
        <T.Black style={{ color: colors.textMuted }}>Seguir sin cuenta (solo en este teléfono)</T.Black>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, gap: 10, width: '100%', maxWidth: 480, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.bg },
  hero: {
    alignSelf: 'center',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 22, padding: 4, marginVertical: 6 },
  tab: { flex: 1, minHeight: 44, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.grey,
    paddingHorizontal: 14,
    fontSize: 17,
    fontFamily: fonts.body,
    color: colors.body,
  },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
