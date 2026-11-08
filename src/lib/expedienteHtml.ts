import { entryDetail, entryTitle, profileLines } from './expediente';
import { formatDate } from './health';
import type { AppData, Attachment, Entry } from './types';

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Datos de los documentos para el PDF: fotos incrustadas y enlaces a los PDF subidos.
export type ShareAssets = { images: Record<string, string>; links: Record<string, string> };

function docHtml(f: Attachment, assets: ShareAssets) {
  const img = assets.images[f.id];
  if (f.type === 'image' && img) return `<img src="${img}" alt="${esc(f.name)}" />`;
  const link = assets.links[f.id];
  if (link) return `<p class="doc">📎 <a href="${esc(link)}">${esc(f.name)}</a></p>`;
  return `<p class="doc">📎 ${esc(f.name)} (archivo guardado en la app)</p>`;
}

// Resumen del expediente en HTML, para convertirlo en un PDF que se pueda enviar a la veterinaria.
// Nunca incluye teléfono ni dirección del dueño.
export function expedienteHtml(data: AppData, entries: Entry[], assets: ShareAssets, now = Date.now()): string {
  const pet = data.pet!;
  const weight = data.entries.find((e) => e.kind === 'peso')?.kg;
  const p = profileLines(pet, data.clinical, weight);
  const rows = entries
    .map((e) => {
      const detail = entryDetail(e);
      const docs = (e.files ?? []).map((f) => docHtml(f, assets)).join('');
      return `<section><h3>${esc(entryTitle(e))} <span>${formatDate(e.at)}</span></h3>${detail ? `<p>${esc(detail)}</p>` : ''}${docs}</section>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8" /><style>
body{font-family:Helvetica,Arial,sans-serif;color:#0F2540;padding:12px}
h1{font-size:22px;margin:0 0 4px}h3{font-size:15px;margin:0 0 4px;display:flex;justify-content:space-between}
h3 span{font-weight:normal;color:#5B6676}p{font-size:13px;margin:2px 0}
section{border-top:1px solid #E7EBF1;padding:10px 0;page-break-inside:avoid}
img{max-width:100%;max-height:420px;margin-top:6px;border-radius:6px}
.alert{color:#B0182D;font-weight:bold}.foot{margin-top:18px;font-size:11px;color:#5B6676}
</style></head><body>
<h1>Expediente de ${esc(pet.name)}</h1>
<p>${esc(p.basics)}</p>
${data.ownerName ? `<p>Dueño: ${esc(data.ownerName)}</p>` : ''}
${p.allergies ? `<p class="alert">Alergias: ${esc(p.allergies)}</p>` : ''}
${p.conditions ? `<p><b>Condiciones:</b> ${esc(p.conditions)}</p>` : ''}
<div style="height:8px"></div>
${rows || '<p>Sin registros.</p>'}
<p class="foot">Generado el ${formatDate(now)} con AnimalApp (prototipo). Lo anotó el dueño; no es un diagnóstico veterinario.</p>
</body></html>`;
}
