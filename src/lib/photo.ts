import * as ImagePicker from 'expo-image-picker';

// Toma o elige una foto. En el teléfono se guarda la dirección del archivo.
export async function pickPhoto(source: 'camara' | 'galeria'): Promise<string | null> {
  if (source === 'camara') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5 };
  const res = source === 'camara' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets[0]) return null;
  return res.assets[0].uri;
}
