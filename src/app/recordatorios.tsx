import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Input, parseTime } from '../components/form';
import { BackHeader, Button, T } from '../components/ui';
import { formatDate, parseDate } from '../lib/health';
import { scheduleAt, scheduleEvery } from '../lib/notify';
import { allReminders } from '../lib/reminders';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { Reminder } from '../lib/types';
import { useNow } from '../lib/useNow';

const two = (n: number) => String(n).padStart(2, '0');

// Agregar, modificar o quitar recordatorios. Las comidas y el paseo diario se cambian en sus ajustes.
export default function Recordatorios() {
  const { data, saveReminder, removeReminder } = useStore();
  const now = useNow();
  const pet = data.pet!;
  const [editing, setEditing] = useState<Reminder | 'nuevo' | null>(null);
  const items = allReminders(data, now).filter((r) => data.reminders.some((x) => x.id === r.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Recordatorios" subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page}>
        {items.length === 0 && <T.Muted style={{ textAlign: 'center', marginTop: 40 }}>No tienes recordatorios propios todavía.</T.Muted>}
        {items.map((r) => (
          <Pressable key={r.id} accessibilityLabel={`Editar ${r.title}`} onPress={() => setEditing(data.reminders.find((x) => x.id === r.id)!)} style={s.row}>
            <View style={{ flex: 1 }}>
              <T.Black style={{ fontSize: 15 }} numberOfLines={2}>
                {r.title}
              </T.Black>
              <T.Muted style={{ fontSize: 13 }}>{r.when}</T.Muted>
            </View>
          </Pressable>
        ))}
        <Button label="Agregar recordatorio" kind="solid" onPress={() => setEditing('nuevo')} />
      </ScrollView>

      {editing && (
        <Editor
          key={editing === 'nuevo' ? 'nuevo' : editing.id}
          reminder={editing === 'nuevo' ? undefined : editing}
          petName={pet.name}
          onSave={(r) => {
            saveReminder(r);
            setEditing(null);
          }}
          onRemove={(id) => {
            removeReminder(id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </View>
  );
}

function Editor({
  reminder,
  petName,
  onSave,
  onRemove,
  onClose,
}: {
  reminder?: Reminder;
  petName: string;
  onSave: (r: Omit<Reminder, 'id'> & { id?: string }) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const start = new Date(reminder?.at ?? Date.now() + 86400000);
  const [title, setTitle] = useState(reminder?.title ?? '');
  const [date, setDate] = useState(formatDate(start.getTime()));
  const [time, setTime] = useState(reminder ? `${two(start.getHours())}:${two(start.getMinutes())}` : '09:00');
  const [hours, setHours] = useState(reminder?.everyHours ? String(reminder.everyHours) : '');

  const day = parseDate(date);
  const clock = parseTime(time);
  const every = Number(hours) > 0 ? Number(hours) : 0;
  const at = day !== null && clock ? new Date(day).setHours(clock.hour, clock.minute) : null;
  const valid = title.trim().length > 0 && at !== null && (every > 0 || at > Date.now());

  const save = async () => {
    if (at === null) return;
    const text = `${petName}: ${title.trim()}`;
    const notificationId = every > 0 ? await scheduleEvery(text, `Toca el aviso (cada ${every} h)`, every) : await scheduleAt(text, 'Recordatorio', at);
    onSave({ id: reminder?.id, entryId: reminder?.entryId ?? '', title: title.trim(), at, everyHours: every || undefined, notificationId });
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <ScrollView style={{ width: '100%', maxWidth: 420, maxHeight: '90%' }} contentContainerStyle={s.sheet} keyboardShouldPersistTaps="handled">
          <T.Display style={{ fontSize: 22 }}>{reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'}</T.Display>
          <Input field={{ key: 'titulo', label: 'Qué te recuerdo', placeholder: 'Vacuna, baño, tomar la pastilla…', required: true }} value={title} onChange={setTitle} />
          <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={date} onChange={setDate} />
          <Input field={{ key: 'hora', label: 'Hora', placeholder: '09:00', required: true }} value={time} onChange={setTime} />
          {clock === null && <T.Muted style={{ color: colors.lostText, fontSize: 13 }}>Escribe la hora como HH:MM</T.Muted>}
          <Input field={{ key: 'cada', label: 'Repetir cada (horas, opcional)', placeholder: '8', number: true }} value={hours} onChange={setHours} />
          <Button label="Guardar" kind="solid" disabled={!valid} onPress={save} />
          {reminder && <Button label="Quitar recordatorio" kind="lost" onPress={() => onRemove(reminder.id)} />}
          <Button label="Cancelar" kind="secondary" onPress={onClose} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, padding: 12, borderRadius: 18, backgroundColor: colors.card },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: 28, padding: 20, gap: 12 },
});
