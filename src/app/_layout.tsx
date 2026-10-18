import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrateModal } from '../components/CelebrateModal';
import { useAppFonts } from '../lib/fonts';
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
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="crear-mascota" />
          <Stack.Screen name="registro" options={{ presentation: 'modal' }} />
        </Stack>
        <CelebrateModal />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
