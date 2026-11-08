import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Button, Card, T, soon } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import { TextInput } from '../components/Text';

// Entrar o crear cuenta, como en la maqueta: correo, contraseña y tres botones.
// Con la nube conectada los datos se guardan también allá; mientras tanto la cuenta vive en este teléfono.
export default function Entrar() {
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const { sync } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'entrar' | 'crear' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Con cuenta en la nube: cuando se trajeron sus datos, sigue a la app.
  useEffect(() => {
    if (auth.session && (sync === 'al-dia' || sync === 'sin-conexion')) router.replace('/');
  }, [auth.session, sync]);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const passOk = password.length >= 8;
  const ready = emailOk && passOk && !busy;

  async function enter() {
    setBusy('entrar');
    setError('');
    setNotice('');
    const r = await auth.signIn(email, password);
    setBusy(null);
    if (r.error) setError(r.error);
    else if (!auth.enabled) router.replace('/');
  }

  async function create() {
    setBusy('crear');
    setError('');
    setNotice('');
    const r = await auth.signUp(email, password);
    setBusy(null);
    if (r.error) setError(r.error);
    else if (r.needsConfirm) setNotice('Te enviamos un correo. Abre el enlace para confirmar tu cuenta y luego toca Entrar.');
    else router.replace('/permisos');
  }

  if (auth.session) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.accent} />
        <T.Muted>Trayendo tus datos de la nube…</T.Muted>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Entrar o crear cuenta" onBack={() => (router.canGoBack() ? router.back() : router.replace('/bienvenida'))} />
      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <PetDrawing species="perro" mood="feliz" size={88} />
        </View>
        <T.Display style={{ fontSize: 30, textAlign: 'center' }}>Animaapp</T.Display>
        <T.Muted style={{ fontSize: 15, textAlign: 'center', marginBottom: 8 }}>Cuida a tu mascota en la vida real y mírala crecer en la app.</T.Muted>

        <T.Eyebrow>CORREO</T.Eyebrow>
        <TextInput
          accessibilityLabel="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={s.input}
        />
        <T.Eyebrow>CONTRASEÑA</T.Eyebrow>
        <TextInput
          accessibilityLabel="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
          style={s.input}
        />
        <Pressable accessibilityRole="link" onPress={() => router.push('/recuperar')} style={s.forgot}>
          <T.Black style={{ color: colors.accent, fontSize: 14 }}>¿Olvidaste tu contraseña?</T.Black>
        </Pressable>
        {password.length > 0 && !passOk ? <T.Muted style={{ fontSize: 13 }}>La contraseña necesita al menos 8 caracteres.</T.Muted> : null}

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

        <View style={{ gap: 10, marginTop: 8 }}>
          <Button label={busy === 'entrar' ? 'Un momento…' : 'Entrar'} kind={modo === 'crear' ? 'primary' : 'solid'} disabled={!ready} onPress={enter} />
          <Button label={busy === 'crear' ? 'Un momento…' : 'Crear cuenta nueva'} kind={modo === 'crear' ? 'solid' : 'secondary'} disabled={!ready} onPress={create} />
          <Button
            label="Seguir con Google o Apple"
            kind="secondary"
            onPress={() => soon('Google o Apple', 'Entrar con tu cuenta de Google o Apple llega cuando conectemos la nube.')}
          />
        </View>
        {!auth.enabled ? <T.Muted style={{ fontSize: 12, textAlign: 'center' }}>Por ahora tu cuenta y tus datos se guardan solo en este teléfono.</T.Muted> : null}

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
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, gap: 8, width: '100%', maxWidth: 480, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.bg },
  hero: { alignSelf: 'center', width: 112, height: 112, borderRadius: 56, backgroundColor: colors.blueTint, alignItems: 'center', justifyContent: 'center' },
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
  forgot: { alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center' },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
