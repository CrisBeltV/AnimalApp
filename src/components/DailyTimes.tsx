import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { cancel, canNotify, scheduleDaily } from '../lib/notify';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import { parseTime } from './form';
import { Button, T } from './ui';

const MEAL_PRESETS = ['07:00', '12:00', '18:00'];
const WALK_PRESETS = ['07:00', '12:00', '18:00'];

const two = (n: number) => String(n).padStart(2, '0');

// Horarios de comida: cada hora es un aviso diario en el teléfono.
export function MealTimes() {
  const { data, setSettings } = useStore();
  const pet = data.pet!;
  const { mealTimes, notifIds } = data.settings;
  const [custom, setCustom] = useState('');

  const add = async (text: string) => {
    const t = parseTime(text);
    if (!t) return;
    const time = `${two(t.hour)}:${two(t.minute)}`;
    if (mealTimes.includes(time)) return;
    const id = await scheduleDaily(`Hora de comer`, `Es hora de la comida de ${pet.name}`, t.hour, t.minute);
    setSettings({
      mealTimes: [...mealTimes, time].sort(),
      notifIds: id ? { ...notifIds, [`comida-${time}`]: id } : notifIds,
    });
    setCustom('');
  };
  const remove = (time: string) => {
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
          <Pressable key={m} accessibilityLabel={`Quitar horario ${m}`} onPress={() => remove(m)} style={[s.chip, s.on]}>
            <T.Black style={{ fontSize: 15 }}>{m}</T.Black>
            <T.Black style={{ fontSize: 13, color: colors.textMuted }}>✕</T.Black>
          </Pressable>
        ))}
      </View>
      <View style={s.wrap}>
        {MEAL_PRESETS.filter((p) => !mealTimes.includes(p)).map((p) => (
          <Pressable key={p} onPress={() => add(p)} style={s.chip}>
            <T.Black style={{ fontSize: 14, color: colors.accent }}>+ {p}</T.Black>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="Otra hora, ej. 20:30"
          placeholderTextColor={colors.textMuted}
          style={s.input}
        />
        <Button label="Añadir" style={{ minHeight: 48 }} disabled={!parseTime(custom)} onPress={() => add(custom)} />
      </View>
      {!canNotify && <T.Muted style={{ fontSize: 12 }}>En el teléfono te llegará un aviso a cada hora.</T.Muted>}
    </View>
  );
}

// Recordatorio diario de paseo a la hora elegida.
export function WalkReminder() {
  const { data, setSettings } = useStore();
  const pet = data.pet!;
  const { walkTime, notifIds } = data.settings;
  const word = pet.species === 'gato' ? 'jugar con' : 'pasear a';

  const choose = async (time?: string) => {
    cancel(notifIds.paseo);
    const rest = { ...notifIds };
    delete rest.paseo;
    if (!time || time === walkTime) {
      setSettings({ walkTime: undefined, notifIds: rest });
      return;
    }
    const t = parseTime(time)!;
    const id = await scheduleDaily(`¿Ya salieron hoy?`, `No olvides ${word} ${pet.name} hoy`, t.hour, t.minute);
    setSettings({ walkTime: time, notifIds: id ? { ...rest, paseo: id } : rest });
  };

  return (
    <View style={s.wrap}>
      {WALK_PRESETS.map((p) => (
        <Pressable
          key={p}
          accessibilityRole="radio"
          accessibilityState={{ checked: walkTime === p }}
          onPress={() => choose(p)}
          style={[s.chip, walkTime === p && s.on]}
        >
          <T.Black style={{ fontSize: 15 }}>{p}</T.Black>
        </Pressable>
      ))}
      <Pressable onPress={() => choose(undefined)} style={[s.chip, !walkTime && s.on]}>
        <T.Black style={{ fontSize: 15 }}>Sin aviso</T.Black>
      </Pressable>
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
  input: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.body,
  },
});
