import { activeTreatments, entryTitle, lastVaccine, profileLines } from './expediente';
import { formatDate } from './health';
import type { AppData } from './types';

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Lo que va en la tarjeta de emergencia, sin teléfonos. Los teléfonos se suman aparte, solo si el dueño lo decide.
export type EmergencyInfo = {
  basics: string;
  allergies?: string;
  conditions?: string;
  treatments: string[];
  vaccine?: string;
  vet?: { name: string; detail?: string; phone?: string };
  ownerName?: string;
  ownerPhone?: string;
};

export function emergencyInfo(data: AppData, now: number): EmergencyInfo {
  const pet = data.pet!;
  const p = profileLines(pet, data.clinical, data.entries.find((e) => e.kind === 'peso')?.kg);
  const vaccine = lastVaccine(data.entries);
  const vet = data.vets[0]; // la última veterinaria que guardó el dueño
  return {
    basics: p.basics,
    allergies: p.allergies,
    conditions: p.conditions,
    treatments: activeTreatments(data.entries, now).map((e) => [entryTitle(e), e.fields?.dosis].filter(Boolean).join(' · ')),
    vaccine: vaccine ? `${entryTitle(vaccine).replace('Vacuna · ', '')} · ${formatDate(vaccine.at)}` : undefined,
    vet: vet && { name: vet.name, detail: [vet.doctor, vet.address, vet.place].filter(Boolean).join(' · ') || undefined, phone: vet.phone },
    ownerName: data.ownerName || undefined,
    ownerPhone: data.clinical?.ownerPhone || undefined,
  };
}

// ¿Hay algún teléfono que preguntar si se comparte?
export const hasPhones = (i: EmergencyInfo) => !!(i.ownerPhone || i.vet?.phone);

export function emergencyHtml(data: AppData, photo: string | undefined, withPhones: boolean, now = Date.now()): string {
  const i = emergencyInfo(data, now);
  const row = (label: string, value?: string, alert = false) =>
    value ? `<p class="${alert ? 'alert' : ''}"><b>${label}:</b> ${esc(value)}</p>` : '';
  return `<!doctype html><html><head><meta charset="utf-8" /><style>
body{font-family:Helvetica,Arial,sans-serif;color:#0F2540;padding:16px}
h1{font-size:26px;margin:0 0 2px}.tag{color:#B0182D;font-weight:bold;font-size:13px;letter-spacing:1px}
p{font-size:15px;margin:6px 0}.alert{color:#B0182D}
img{width:110px;height:110px;object-fit:cover;border-radius:55px;float:right;margin-left:12px}
.foot{margin-top:20px;font-size:11px;color:#5B6676}
</style></head><body>
<p class="tag">TARJETA DE EMERGENCIA</p>
${photo ? `<img src="${photo}" alt="" />` : ''}
<h1>${esc(data.pet!.name)}</h1>
<p>${esc(i.basics)}</p>
${row('Alergias', i.allergies, true)}
${row('Condiciones', i.conditions)}
${i.treatments.length ? row('En tratamiento', i.treatments.join('; ')) : ''}
${row('Última vacuna', i.vaccine)}
${i.vet ? row('Veterinaria', [i.vet.name, i.vet.detail, withPhones ? i.vet.phone : ''].filter(Boolean).join(' · ')) : ''}
${row('Dueño', [i.ownerName, withPhones ? i.ownerPhone : ''].filter(Boolean).join(' · '))}
<p class="foot">Generado el ${formatDate(now)} con AnimalApp (prototipo). Lo anotó el dueño; no es un diagnóstico veterinario.</p>
</body></html>`;
}
