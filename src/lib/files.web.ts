import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import type { Attachment } from './types';

// En la web los documentos se guardan como texto dentro de los datos, que tienen poco espacio:
// las fotos se achican más y los PDF pueden pesar hasta 2 MB.
export const MAX_BYTES = 2 * 1024 * 1024;
const MAX_SIDE = 1600;

export type Source = 'camara' | 'galeria' | 'archivo';
export type Picked = { added: Attachment[]; rejected: string[] };

const newId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function shrink(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = src;
  });
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const sizeOf = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4);

export async function pickFiles(source: Source): Promise<Picked> {
  const out: Picked = { added: [], rejected: [] };

  if (source === 'archivo') {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], multiple: true });
    if (res.canceled) return out;
    for (const a of res.assets) {
      try {
        const blob = a.file ?? (await (await fetch(a.uri)).blob());
        if (a.mimeType === 'application/pdf') {
          if (blob.size > MAX_BYTES) throw new Error('grande');
          const uri = await toDataUrl(blob);
          out.added.push({ id: newId(), uri, type: 'pdf', name: a.name, size: blob.size });
        } else {
          const uri = await shrink(await toDataUrl(blob));
          out.added.push({ id: newId(), uri, type: 'image', name: a.name.replace(/\.[^.]+$/, '') + '.jpg', size: sizeOf(uri) });
        }
      } catch {
        out.rejected.push(a.name);
      }
    }
    return out;
  }

  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, allowsMultipleSelection: source === 'galeria' };
  const res = source === 'camara' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled) return out;
  for (const a of res.assets) {
    const name = a.fileName ?? `foto-${Date.now()}.jpg`;
    try {
      const uri = await shrink(a.uri);
      out.added.push({ id: newId(), uri, type: 'image', name: name.replace(/\.[^.]+$/, '') + '.jpg', size: sizeOf(uri) });
    } catch {
      out.rejected.push(name);
    }
  }
  return out;
}

// En la web los archivos viven dentro de los datos del registro: no hay nada más que borrar.
export function deleteFiles(_files?: Attachment[]) {}

export function sizeLabel(bytes?: number) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
