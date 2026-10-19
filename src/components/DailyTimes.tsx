import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cancel, canNotify, scheduleDaily } from '../lib/notify';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import { parseTime } from './form';
import { Button, T } from './ui';

const two = (n: number) => String(n).padStart(2, '0');

// "18:30" -> "6:30 p. m."
export function time12(time: string) {
  const t = parseTime(time);
  if (!t) return time;
  const h = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return `${h}:${two(t.minute)} ${t.hour < 12 ? 'a. m.' : 'p. m.'}`;
}

// Elegir cualquier hora del día: hora de 1 a 12, minutos y a. m. o p. m.
export function TimePicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const t = parseTime(value) ?? { hour: 18, minute: 0 };
  const pm = t.hour >= 12;
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  const set = (hour12: number, minute: number, isPm: boolean) => {
    const hour = (hour12 % 12) + (isPm ? 12 : 0);
    onChange(`${two(hour)}:${two(minute)}`);
  };
  const step = (n: number, d: number, max: number, min = 0) => (n + d > max ? min : n + d < min ? max : n + d);
  return (
    <View style={s.picker}>
      <Stepper
        label="Hora"
        value={String(h12)}
        onMinus={() => set(step(h12, -1, 12, 1), t.minute, pm)}
        onPlus={() => set(step(h12, 1, 12, 1), t.minute, pm)}
      />
      <Text style={s.colon}>:</Text>
      <Stepper
        label="Minutos"
        value={two(t.minute)}
        onMinus={() => set(h12, step(t.minute, -5, 55), pm)}
        onPlus={() => set(h12, step(t.minute, 5, 55), pm)}
      />
      <View style={{ gap: 6 }}>
        {(['a. m.', 'p. m.'] as const).map((label, i) => {
          const on = (i === 1) === pm;
          return (
            <Pressable
              key={label}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => set(h12, t.minute, i === 1)}
              style={[s.ampm, on && s.on]}
            >
              <T.Black style={{ fontSize: 14 }}>{label}</T.Black>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={s.stepper}>
      <Pressable accessibilityLabel={`Subir ${label.toLowerCase()}`} onPress={onPlus} style={s.arrow}>
        <T.Black style={{ fontSize: 16 }}>▲</T.Black>
      </Pressable>
      <Text accessibilityLabel={label} style={s.value}>
        {value}
      </Text>
      <Pressable accessibilityLabel={`Bajar ${label.toLowerCase()}`} onPress={onMinus} style={s.arrow}>
        <T.Black style={{ fontSize: 16 }}>▼</T.Black>
      </Pressable>
    </View>
  );
}

// Horarios de comida: cada hora es un aviso diario en el teléfono. Toca uno para cambiarlo.
export function MealTimes() {
  const { data, setSettings } = useStore();
  const pet = data.pet!;
  const { mealTimes, notifIds } = data.settings;
  // editing: horario que se está cambiando ('' = uno nuevo); picking: la hora elegida.
  const [editing, setEditing] = useState<string | null>(null);
  const [picking, setPicking] = useState('07:00');

  const open = (time: string) => {
    setEditing(time);
    setPicking(time || '07:00');
  };
  const save = async () => {
    const old = editing;
    setEditing(null);
    const ids = { ...notifIds };
    let times = mealTimes;
    if (old) {
      cancel(ids[`comida-${old}`]);
      delete ids[`comida-${old}`];
      times = times.filter((m) => m !== old);
    }
    if (!times.includes(picking)) {
      const t = parseTime(picking)!;
      const id = await scheduleDaily('Hora de comer', `Es hora de la comida de ${pet.name}`, t.hour, t.minute);
      if (id) ids[`comida-${picking}`] = id;
      times = [...times, picking].sort();
    }
    setSettings({ mealTimes: times, notifIds: ids });
  };
  const remove = (time: string) => {
    setEditing(null);
    cancel(notifIds[`comida-${time}`]);
    const rest = { ...notifIds };
    delete rest[`comida-${time}`];
    setSettings({ mealTimes: mealTimes.filter((m) => m !== time), notifIds: rest });
  };

  return (
    <View style={{ gap: 10 }}>
      {mealTimes.length === 0 ? <T.Muted style={{ fontSize: 13 }}>Aún no hay horarios.</T.Muted> : null}
      <View style={s.wrap}>
        {mealTimes.map((m) => (
          <Pressable key={m} accessibilityLabel={`Editar horario ${time12(m)}`} onPress={() => open(m)} style={[s.chip, s.on, editing === m && s.editing]}>
            <T.Black style={{ fontSize: 15 }}>{time12(m)}</T.Black>
            <T.Black style={{ fontSize: 13, color: colors.accent }}>✎</T.Black>
          </Pressable>
        ))}
      </View>
      {editing !== null ? (
        <View style={s.editBox}>
          <T.Black>{editing ? `Editar aviso de las ${time12(editing)}` : 'Nuevo horario'}</T.Black>
          <TimePicker value={picking} onChange={setPicking} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setEditing(null)} />
            <Button label={editing ? 'Guardar cambio' : `Añadir ${time12(picking)}`} kind="solid" style={{ flex: 1 }} onPress={save} />
          </View>
          {editing ? <Button label="Quitar este horario" kind="lost" onPress={() => remove(editing)} /> : null}
        </View>
      ) : (
        <Button label="+ Añadir horario" onPress={() => open('')} />
      )}
      {!canNotify && <T.Muted style={{ fontSize: 12 }}>En el teléfono te llegará un aviso a cada hora.</T.Muted>}
    </View>
  );
}

// Recordatorio diario de paseo a cualquier hora, con a. m. o p. m.
export function WalkReminder() {
  const { data, setSettings } = useStore();
  const pet = data.pet!;
  const { walkTime, notifIds } = data.settings;
  const [draft, setDraft] = useState(walkTime ?? '18:00');
  const word = pet.species === 'gato' ? 'jugar con' : 'pasear a';

  const save = async (time?: string) => {
    cancel(notifIds.paseo);
    const rest = { ...notifIds };
    delete rest.paseo;
    if (!time) {
      setSettings({ walkTime: undefined, notifIds: rest });
      return;
    }
    const t = parseTime(time)!;
    const id = await scheduleDaily('¿Ya salieron hoy?', `No olvides ${word} ${pet.name} hoy`, t.hour, t.minute);
    setSettings({ walkTime: time, notifIds: id ? { ...rest, paseo: id } : rest });
  };

  return (
    <View style={{ gap: 10 }}>
      <T.Muted style={{ fontSize: 13 }}>{walkTime ? `Activo todos los días a las ${time12(walkTime)}` : 'Sin aviso por ahora'}</T.Muted>
      <TimePicker value={draft} onChange={setDraft} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {walkTime ? <Button label="Quitar aviso" kind="secondary" style={{ flex: 1 }} onPress={() => save(undefined)} /> : null}
        <Button
          label={walkTime === draft ? 'Guardado' : `Avisarme a las ${time12(draft)}`}
          kind="solid"
          style={{ flex: 2 }}
          disabled={walkTime === draft}
          onPress={() => save(draft)}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.grey,
    backgroundColor: colors.card,
  },
  on: { backgroundColor: colors.blue, borderColor: colors.accent },
  editing: { backgroundColor: colors.lilacSoft, borderColor: colors.lilacStrong },
  editBox: { gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.bg },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  stepper: { alignItems: 'center', gap: 2 },
  arrow: { width: 56, height: 36, borderRadius: 12, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: fonts.display, fontWeight: '700', fontSize: 34, color: colors.text, minWidth: 56, textAlign: 'center' },
  colon: { fontFamily: fonts.display, fontWeight: '700', fontSize: 34, color: colors.text },
  ampm: {
    minWidth: 64,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
