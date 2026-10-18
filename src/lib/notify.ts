import * as Notifications from 'expo-notifications';

// Avisos del teléfono para los recordatorios de salud.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function allowed() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Agenda un aviso en una fecha. Devuelve su id, o undefined si no hay permiso.
export async function scheduleAt(title: string, body: string, at: number) {
  if (at <= Date.now() || !(await allowed())) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
  });
}

// Aviso que se repite cada cierto número de horas (tomas de un medicamento).
export async function scheduleEvery(title: string, body: string, hours: number) {
  if (hours <= 0 || !(await allowed())) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: hours * 3600, repeats: true },
  });
}

export async function cancel(id?: string) {
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export const canNotify = true;
