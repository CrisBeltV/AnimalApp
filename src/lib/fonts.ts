import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { NunitoSans_400Regular, NunitoSans_700Bold, NunitoSans_800ExtraBold } from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';

// Teléfono: carga Fredoka y Nunito Sans desde el paquete de la app.
export function useAppFonts() {
  const [loaded, error] = useFonts({
    'Fredoka-Bold': Fredoka_700Bold,
    'NunitoSans-Regular': NunitoSans_400Regular,
    'NunitoSans-Bold': NunitoSans_700Bold,
    'NunitoSans-ExtraBold': NunitoSans_800ExtraBold,
  });
  return loaded || !!error;
}
