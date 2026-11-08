import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../components/Icon';
import { BackHeader, Button, Card, T } from '../components/ui';
import { useAuth } from '../lib/auth';
import { colors, fonts, radius } from '../lib/theme';
import { TextInput } from '../components/Text';

// Recuperar contraseña: se escribe el correo y llega un enlace (cuando la nube esté conectada).
export default function Recuperar() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());

  const send = async () => {
    setBusy(true);
    setError('');
    const r = await auth.resetPassword(email);
    setBusy(false);
    if (r.error) setError(r.error);
    else setSent(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Recuperar contraseña" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.lock}>
          <Icon name="entrar" size={52} color={colors.accent} strokeWidth={2} />
        </View>
        {sent ? (
          <>
            <T.Display style={{ fontSize: 24, textAlign: 'center' }}>Revisa tu correo</T.Display>
            <T.Muted style={{ fontSize: 15, textAlign: 'center' }}>Si el correo tiene una cuenta, el enlace llega en un par de minutos. Revisa también la carpeta de spam.</T.Muted>
            <Button label="Enviar de nuevo" kind="secondary" onPress={() => setSent(false)} />
            <Button label="Volver a entrar" kind="solid" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <T.Muted style={{ fontSize: 15, textAlign: 'center' }}>Escribe el correo de tu cuenta y te enviamos un enlace para crear una contraseña nueva.</T.Muted>
            <T.Eyebrow>CORREO</T.Eyebrow>
            <TextInput
              accessibilityLabel="Correo"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={s.input}
            />
            {error ? (
              <Card style={{ backgroundColor: colors.lilacSoft }}>
                <T.Bold style={{ color: colors.lilacText }}>{error}</T.Bold>
              </Card>
            ) : null}
            <Button label={busy ? 'Un momento…' : 'Enviar enlace'} kind="solid" disabled={!emailOk || busy} onPress={send} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 480, alignSelf: 'center' },
  lock: { alignSelf: 'center', width: 120, height: 120, borderRadius: 60, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  input: { minHeight: 50, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 2, borderColor: colors.grey, paddingHorizontal: 14, fontSize: 17, fontFamily: fonts.body, color: colors.body },
});
