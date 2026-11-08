import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { expedienteHtml } from './expedienteHtml';
import type { ShareAssets } from './expedienteHtml';
import { supabase } from './supabase';
import type { AppData, Entry } from './types';

const BUCKET = 'expediente';
const SEVEN_DAYS = 7 * 24 * 3600;

// Sube el PDF al bucket privado y devuelve un enlace que vence a los 7 días.
async function linkFor(userId: string, id: string, uri: string): Promise<string | undefined> {
  if (!supabase) return undefined;
  const path = `${userId}/${id}.pdf`;
  const bytes = await new File(uri).bytes();
  const up = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'application/pdf', upsert: true });
  if (up.error) return undefined;
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, SEVEN_DAYS);
  return signed.data?.signedUrl;
}

// Arma un PDF con el resumen de los registros elegidos y abre la hoja de compartir.
// Las fotos van dentro del PDF; los PDF adjuntos van como enlace (solo con cuenta).
// Devuelve cuántos PDF adjuntos quedaron sin enlace.
export async function shareExpediente(data: AppData, entries: Entry[], userId?: string | null): Promise<{ unlinked: number }> {
  const assets: ShareAssets = { images: {}, links: {} };
  let unlinked = 0;
  const photo = data.clinical?.photo;
  for (const f of [...(photo ? [photo] : []), ...entries.flatMap((e) => e.files ?? [])]) {
    try {
      if (f.type === 'image') {
        assets.images[f.id] = `data:image/jpeg;base64,${await new File(f.uri).base64()}`;
      } else {
        const link = userId ? await linkFor(userId, f.id, f.uri) : undefined;
        if (link) assets.links[f.id] = link;
        else unlinked += 1;
      }
    } catch {
      if (f.type === 'pdf') unlinked += 1;
    }
  }

  const { uri } = await Print.printToFileAsync({ html: expedienteHtml(data, entries, assets), width: 612, height: 792 });
  const name = `Expediente-${(data.pet?.name ?? 'mascota').replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`;
  const dest = new File(Paths.cache, name);
  new File(uri).copy(dest, { overwrite: true });
  await Sharing.shareAsync(dest.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Compartir expediente' });
  return { unlinked };
}
