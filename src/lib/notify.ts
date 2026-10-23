import type * as NotificationsType from 'expo-notifications';

// Expo Go no siempre trae el módulo nativo de avisos: si falta, la app sigue y los recordatorios quedan solo en la lista de Salud.
let Notifications: typeof NotificationsType | null = null;
try {
  // require (y no import) para poder atrapar el fallo si el módulo nativo no existe.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

// Avisos del teléfono para los recordatorios de salud.
Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function allowed() {
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Agenda un aviso en una fecha. Devuelve su id, o undefined si no hay permiso.
export async function scheduleAt(title: string, body: string, at: number) {
  if (at <= Date.now() || !(await allowed())) return undefined;
  return Notifications!.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications!.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
  });
}

// Aviso que se repite cada cierto número de horas (tomas de un medicamento).
export async function scheduleEvery(title: string, body: string, hours: number) {
  if (hours <= 0 || !(await allowed())) return undefined;
  return Notifications!.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications!.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: hours * 3600, repeats: true },
  });
}

export async function cancel(id?: string) {
  if (id && Notifications) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export const canNotify = Notifications !== null;

// Aviso diario a una hora fija (horarios de comida, recordatorio de paseo).
export async function scheduleDaily(title: string, body: string, hour: number, minute: number) {
  if (!(await allowed())) return undefined;
  return Notifications!.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications!.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}
