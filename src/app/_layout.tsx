import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrateModal } from '../components/CelebrateModal';
import { AuthProvider } from '../lib/auth';
import { useAppFonts } from '../lib/fonts';
import { LangProvider } from '../lib/i18n';
import { StoreProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!fontsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <AuthProvider>
      <StoreProvider>
        <LangProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="crear-mascota" />
          <Stack.Screen name="bienvenida" />
          <Stack.Screen name="entrar" />
          <Stack.Screen name="recuperar" />
          <Stack.Screen name="permisos" />
          <Stack.Screen name="registro" options={{ presentation: 'modal' }} />
        </Stack>
        <CelebrateModal />
        </LangProvider>
      </StoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
