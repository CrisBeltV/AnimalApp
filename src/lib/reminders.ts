import { activityWord } from './game';
import { clock12, whenText } from './reports';
import type { AppData } from './types';

export type ReminderItem = { id: string; icon: string; title: string; when: string; next: number; off?: boolean };

// "07:30" -> la próxima vez que llega esa hora (hoy o mañana).
function nextDaily(time: string, now: number) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(now);
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h || 0, m || 0).getTime();
  return t >= now ? t : t + 864e5;
}

// Todos los recordatorios en una sola lista, ordenados por el próximo aviso:
// los de salud (vacunas, medicamentos, citas, higiene), las comidas y el paseo diario.
export function allReminders(data: AppData, now: number): ReminderItem[] {
  const list: ReminderItem[] = [];
  for (const r of data.reminders) {
    if (r.everyHours) {
      const step = r.everyHours * 3600000;
      const next = r.at >= now ? r.at : r.at + Math.ceil((now - r.at) / step) * step;
      list.push({ id: r.id, icon: '💊', title: r.title, when: `Cada ${r.everyHours} h · próxima ${whenText(next)}`, next });
    } else if (r.at >= now - 3600000) {
      list.push({ id: r.id, icon: '📅', title: r.title, when: whenText(r.at), next: r.at });
    }
  }
  const { settings } = data;
  for (const time of settings.mealTimes) {
    const next = nextDaily(time, now);
    list.push({
      id: `comida-${time}`,
      icon: '🍽️',
      title: settings.mealNames?.[time] || 'Comida',
      when: `Todos los días · ${clock12(next)}`,
      next,
      off: settings.mealOff?.includes(time),
    });
  }
  if (settings.walkTime && data.pet) {
    const next = nextDaily(settings.walkTime, now);
    const word = activityWord(data.pet.species).toLowerCase();
    list.push({ id: 'paseo', icon: '🐾', title: `Hora del ${word} con ${data.pet.name}`, when: `Todos los días · ${clock12(next)}`, next });
  }
  return list.sort((a, b) => a.next - b.next);
}
