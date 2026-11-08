import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { ActivityIndicator, View } from 'react-native';

import { BottomBar } from '../../components/BottomBar';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

// Al abrir la app se muestra Inicio (Paseo), aunque en la barra vaya en el centro.
export const unstable_settings = { initialRouteName: 'index' };

export default function TabsLayout() {
  const { ready, data } = useStore();
  const auth = useAuth();

  if (!ready || !auth.ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  // La primera vez: bienvenida, entrar o crear cuenta (o seguir sin cuenta) y luego crear la mascota.
  // Con la nube conectada, siempre se pide entrar.
  if (auth.enabled && !auth.session && !auth.skipped) return <Redirect href="/bienvenida" />;
  if (!data.pet && !auth.signedIn && !auth.skipped) return <Redirect href="/bienvenida" />;
  if (!data.pet) return <Redirect href="/crear-mascota" />;

  return (
    <Tabs
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="mascota" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="comunidad" />
    </Tabs>
  );
}
