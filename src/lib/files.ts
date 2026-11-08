import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

import type { Attachment } from './types';

// Documentos del expediente (fórmulas, radiografías, exámenes). Las fotos se achican a JPEG y
// se copian a una carpeta permanente de la app; los PDF se guardan sin tocarlos.
export const MAX_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 2400;
const QUALITY = 0.8;

export type Source = 'camara' | 'galeria' | 'archivo';
export type Picked = { added: Attachment[]; rejected: string[] };

const newId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function keep(uri: string, id: string, ext: string) {
  const dir = new Directory(Paths.document, 'expediente');
  if (!dir.exists) dir.create({ intermediates: true });
  const dest = new File(dir, `${id}.${ext}`);
  new File(uri).copy(dest);
  return dest;
}

const imageSize = (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject),
  );

async function fromImage(uri: string, name: string, width: number, height: number): Promise<Attachment> {
  const id = newId();
  // Siempre se recomprime a JPEG, para que todas las fotos queden en un formato que abre cualquier aparato.
  const ctx = ImageManipulator.ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > MAX_SIDE) ctx.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  const img = await ctx.renderAsync();
  const saved = await img.saveAsync({ format: ImageManipulator.SaveFormat.JPEG, compress: QUALITY });
  const file = keep(saved.uri, id, 'jpg');
  return { id, uri: file.uri, type: 'image', name: name.replace(/\.[^.]+$/, '') + '.jpg', size: file.size };
}

// Toma una foto, elige de la galería o elige un PDF o imagen de los archivos del teléfono.
export async function pickFiles(source: Source): Promise<Picked> {
  const out: Picked = { added: [], rejected: [] };

  if (source === 'archivo') {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], multiple: true });
    if (res.canceled) return out;
    for (const a of res.assets) {
      if ((a.size ?? 0) > MAX_BYTES) {
        out.rejected.push(a.name);
        continue;
      }
      try {
        if (a.mimeType === 'application/pdf') {
          const id = newId();
          const file = keep(a.uri, id, 'pdf');
          out.added.push({ id, uri: file.uri, type: 'pdf', name: a.name, size: file.size });
        } else {
          const { width, height } = await imageSize(a.uri);
          out.added.push(await fromImage(a.uri, a.name, width, height));
        }
      } catch {
        out.rejected.push(a.name);
      }
    }
    return out;
  }

  if (source === 'camara') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return out;
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, allowsMultipleSelection: source === 'galeria' };
  const res = source === 'camara' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled) return out;
  for (const a of res.assets) {
    const name = a.fileName ?? `foto-${Date.now()}.jpg`;
    try {
      out.added.push(await fromImage(a.uri, name, a.width, a.height));
    } catch {
      out.rejected.push(name);
    }
  }
  return out;
}

// Borra del teléfono los archivos de un registro que ya no los usa.
export function deleteFiles(files?: Attachment[]) {
  for (const f of files ?? []) {
    try {
      const file = new File(f.uri);
      if (file.exists) file.delete();
    } catch {
      // Si el archivo ya no está, no pasa nada.
    }
  }
}

export function sizeLabel(bytes?: number) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
