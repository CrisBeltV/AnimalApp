import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { dayText, whenText } from '../lib/reports';
import { colors, fonts, radius, shadow } from '../lib/theme';
import { TimePicker } from './DailyTimes';
import { Check, parseTime } from './form';
import { Button, T } from './ui';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const two = (n: number) => String(n).padStart(2, '0');

export type When = { at: number; dayOnly: boolean };

const midnight = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const hhmm = (t: number) => {
  const d = new Date(t);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
};
const join = (day: number, time: string) => {
  const t = parseTime(time) ?? { hour: 12, minute: 0 };
  const d = new Date(day);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.hour, t.minute).getTime();
};

// "¿Cuándo?" en dos pasos: primero el día en un calendario (sin días futuros), luego la hora.
export function WhenSheet({
  visible,
  value,
  question,
  onDone,
  onClose,
}: {
  visible: boolean;
  value: When;
  question: string; // "¿Qué día se perdió?"
  onDone: (v: When) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'dia' | 'hora'>('dia');
  const [day, setDay] = useState(midnight(value.at));
  const [time, setTime] = useState(hhmm(value.at));
  const [dayOnly, setDayOnly] = useState(value.dayOnly);
  const [view, setView] = useState({ y: new Date(value.at).getFullYear(), m: new Date(value.at).getMonth() });
  const [menu, setMenu] = useState<'mes' | 'año' | null>(null);
  const [wasVisible, setWasVisible] = useState(false);
  // Cada vez que se abre, arranca en el día guardado.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep('dia');
      setDay(midnight(value.at));
      setTime(hhmm(value.at));
      setDayOnly(value.dayOnly);
      setView({ y: new Date(value.at).getFullYear(), m: new Date(value.at).getMonth() });
      setMenu(null);
    }
  }

  const now = Date.now();
  const today = midnight(now);
  const nowDate = new Date(now);
  const first = new Date(view.y, view.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const canNext = view.y < nowDate.getFullYear() || (view.y === nowDate.getFullYear() && view.m < nowDate.getMonth());
  const move = (k: number) => {
    const d = new Date(view.y, view.m + k, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const pickDay = (t: number) => {
    setDay(t);
    const d = new Date(t);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const at = join(day, time);
  const future = !dayOnly && at > now + 60000;
  const ago = (h: number) => {
    const t = now - h * 3600000;
    pickDay(midnight(t));
    setTime(hhmm(t));
    setDayOnly(false);
  };
  const years = Array.from({ length: 6 }, (_, i) => nowDate.getFullYear() - i);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Cerrar" style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, shadow]}>
        <View style={s.steps}>
          {(['dia', 'hora'] as const).map((k, i) => (
            <View key={k} style={[s.stepPill, step === k && s.stepOn]}>
              <T.Black style={{ fontSize: 13, color: step === k ? '#FFFFFF' : colors.textMuted }}>
                {i + 1}. {k === 'dia' ? 'Día' : 'Hora'}
              </T.Black>
            </View>
          ))}
        </View>

        {step === 'dia' ? (
          <>
            <T.Display style={{ fontSize: 20 }}>{question}</T.Display>
            <View style={s.head}>
              <Pressable accessibilityLabel="Mes anterior" onPress={() => move(-1)} style={s.nav}>
                <T.Black>‹</T.Black>
              </Pressable>
              <Pressable accessibilityLabel="Elegir mes" onPress={() => setMenu(menu === 'mes' ? null : 'mes')} style={[s.drop, { flex: 1.4 }]}>
                <Text style={s.dropText}>{MONTHS[view.m]} ▾</Text>
              </Pressable>
              <Pressable accessibilityLabel="Elegir año" onPress={() => setMenu(menu === 'año' ? null : 'año')} style={s.drop}>
                <Text style={s.dropText}>{view.y} ▾</Text>
              </Pressable>
              <Pressable accessibilityLabel="Mes siguiente" disabled={!canNext} onPress={() => move(1)} style={[s.nav, !canNext && { opacity: 0.35 }]}>
                <T.Black>›</T.Black>
              </Pressable>
            </View>
            {menu ? (
              <ScrollView style={{ maxHeight: 250 }} contentContainerStyle={s.menu}>
                {menu === 'mes'
                  ? MONTHS.map((name, m) => {
                      const off = view.y === nowDate.getFullYear() && m > nowDate.getMonth();
                      return (
                        <Pressable
                          key={name}
                          disabled={off}
                          onPress={() => {
                            setView({ y: view.y, m });
                            setMenu(null);
                          }}
                          style={[s.menuItem, m === view.m && s.on, off && { opacity: 0.35 }]}
                        >
                          <T.Black style={{ fontSize: 14, color: m === view.m ? '#FFFFFF' : colors.text }}>{name}</T.Black>
                        </Pressable>
                      );
                    })
                  : years.map((y) => (
                      <Pressable
                        key={y}
                        onPress={() => {
                          setView({ y, m: y === nowDate.getFullYear() ? Math.min(view.m, nowDate.getMonth()) : view.m });
                          setMenu(null);
                        }}
                        style={[s.menuItem, y === view.y && s.on]}
                      >
                        <T.Black style={{ fontSize: 14, color: y === view.y ? '#FFFFFF' : colors.text }}>{y}</T.Black>
                      </Pressable>
                    ))}
              </ScrollView>
            ) : (
              <View style={s.grid}>
                {DAYS.map((d, i) => (
                  <View key={`h${i}`} style={s.cell}>
                    <T.Muted style={{ fontSize: 12 }}>{d}</T.Muted>
                  </View>
                ))}
                {cells.map((d, i) => {
                  if (!d) return <View key={i} style={s.cell} />;
                  const t = new Date(view.y, view.m, d).getTime();
                  const off = t > today;
                  const on = t === day;
                  return (
                    <View key={i} style={s.cell}>
                      <Pressable
                        accessibilityLabel={`${d} de ${MONTHS[view.m]}`}
                        accessibilityState={{ disabled: off, selected: on }}
                        disabled={off}
                        onPress={() => pickDay(t)}
                        style={[s.day, t === today && s.today, on && s.on, off && { opacity: 0.3 }]}
                      >
                        <T.Black style={{ fontSize: 15, color: on ? '#FFFFFF' : colors.text }}>{d}</T.Black>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={s.quick}>
              {['Hoy', 'Ayer', 'Anteayer'].map((label, i) => {
                const t = midnight(now - i * 864e5);
                return (
                  <Pressable key={label} onPress={() => pickDay(t)} style={[s.quickBtn, day === t && s.quickOn]}>
                    <T.Black style={{ fontSize: 14 }}>{label}</T.Black>
                  </Pressable>
                );
              })}
            </View>
            <Button label="Siguiente: elegir la hora" kind="solid" onPress={() => setStep('hora')} />
          </>
        ) : (
          <>
            <View style={s.chosen}>
              <View style={{ flex: 1 }}>
                <T.Muted style={{ fontSize: 12 }}>Día</T.Muted>
                <T.Black>{dayText(day)}</T.Black>
              </View>
              <Pressable onPress={() => setStep('dia')} style={s.change}>
                <T.Black style={{ color: colors.accent, fontSize: 14 }}>Cambiar</T.Black>
              </Pressable>
            </View>
            <T.Display style={{ fontSize: 20 }}>¿A qué hora, más o menos?</T.Display>
            <View style={dayOnly ? { opacity: 0.4 } : undefined} pointerEvents={dayOnly ? 'none' : 'auto'}>
              <TimePicker value={time} onChange={setTime} />
            </View>
            <View style={s.quick}>
              {[
                { label: 'Ahora', h: 0 },
                { label: 'Hace 1 h', h: 1 },
                { label: 'Hace 3 h', h: 3 },
              ].map((q) => (
                <Pressable key={q.label} onPress={() => ago(q.h)} style={s.quickBtn}>
                  <T.Black style={{ fontSize: 14 }}>{q.label}</T.Black>
                </Pressable>
              ))}
            </View>
            <Check label="No sé la hora exacta" detail="Se publica solo el día" on={dayOnly} onPress={() => setDayOnly(!dayOnly)} />
            {future ? <T.Bold style={{ color: colors.lostText, fontSize: 13 }}>Esa hora todavía no llega. Elige una hora pasada.</T.Bold> : null}
            <Button
              label={`✓ Listo · ${dayOnly ? dayText(day) : whenText(at)}`}
              kind="solid"
              disabled={future}
              onPress={() => onDone({ at: dayOnly ? join(day, '12:00') : at, dayOnly })}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignSelf: 'center',
    maxWidth: 560,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  steps: { flexDirection: 'row', gap: 8 },
  stepPill: { paddingHorizontal: 12, height: 28, borderRadius: 14, backgroundColor: colors.grey, justifyContent: 'center' },
  stepOn: { backgroundColor: colors.accent },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nav: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  drop: { flex: 1, height: 40, borderRadius: 12, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  dropText: { fontFamily: fonts.display, fontWeight: '700', fontSize: 16, color: colors.text },
  menu: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  menuItem: { minWidth: 96, height: 40, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 2, borderColor: colors.blueOutline },
  on: { backgroundColor: colors.accent, borderColor: colors.accent },
  quick: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, height: 40, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.grey, alignItems: 'center', justifyContent: 'center' },
  quickOn: { backgroundColor: colors.blue, borderColor: colors.blueOutline },
  chosen: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: colors.blue },
  change: { paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center' },
});
