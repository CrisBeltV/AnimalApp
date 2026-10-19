import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatDate, parseDate } from '../lib/health';
import { colors, fonts, radius, shadow } from '../lib/theme';
import { Button, T } from './ui';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Calendario para elegir día, mes y año tocando. La fecha queda escrita como DD/MM/AAAA.
export function CalendarSheet({
  visible,
  value,
  title = 'Elige la fecha',
  onPick,
  onClose,
}: {
  visible: boolean;
  value?: string;
  title?: string;
  onPick: (date: string) => void;
  onClose: () => void;
}) {
  const chosen = parseDate(value);
  const base = new Date(chosen ?? Date.now());
  const [month, setMonth] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const [years, setYears] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  // Al abrir con otra fecha, el calendario va a ese mes.
  if (value !== lastValue) {
    setLastValue(value);
    setMonth({ y: base.getFullYear(), m: base.getMonth() });
  }

  const first = new Date(month.y, month.m, 1);
  const offset = (first.getDay() + 6) % 7; // semana empieza el lunes
  const count = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === month.y && today.getMonth() === month.m && today.getDate() === d;
  const isChosen = (d: number) => chosen !== null && formatDate(chosen) === formatDate(new Date(month.y, month.m, d).getTime());
  const move = (k: number) => {
    const d = new Date(month.y, month.m + k, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const yearList = Array.from({ length: 36 }, (_, i) => today.getFullYear() + 5 - i);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Cerrar calendario" style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, shadow]}>
        <T.Black style={{ textAlign: 'center' }}>{title}</T.Black>
        <View style={s.head}>
          <Pressable accessibilityLabel="Mes anterior" onPress={() => move(-1)} style={s.nav}>
            <T.Black>‹</T.Black>
          </Pressable>
          <Pressable accessibilityLabel="Elegir año" onPress={() => setYears(!years)} style={s.title}>
            <Text style={s.titleText}>
              {MONTHS[month.m]} {month.y} ▾
            </Text>
          </Pressable>
          <Pressable accessibilityLabel="Mes siguiente" onPress={() => move(1)} style={s.nav}>
            <T.Black>›</T.Black>
          </Pressable>
        </View>
        {years ? (
          <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={s.years}>
            {yearList.map((y) => (
              <Pressable
                key={y}
                onPress={() => {
                  setMonth({ y, m: month.m });
                  setYears(false);
                }}
                style={[s.year, y === month.y && s.on]}
              >
                <T.Black style={{ fontSize: 15, color: y === month.y ? '#FFFFFF' : colors.text }}>{y}</T.Black>
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
            {cells.map((d, i) => (
              <View key={i} style={s.cell}>
                {d ? (
                  <Pressable
                    accessibilityLabel={`${d} de ${MONTHS[month.m]}`}
                    onPress={() => onPick(formatDate(new Date(month.y, month.m, d).getTime()))}
                    style={[s.day, isToday(d) && s.today, isChosen(d) && s.on]}
                  >
                    <T.Black style={{ fontSize: 15, color: isChosen(d) ? '#FFFFFF' : colors.text }}>{d}</T.Black>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Cerrar" kind="secondary" style={{ flex: 1 }} onPress={onClose} />
          <Button label="Hoy" style={{ flex: 1 }} onPress={() => onPick(formatDate(Date.now()))} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  sheet: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    width: 340,
    maxWidth: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nav: { width: 44, height: 40, borderRadius: 12, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: colors.blue },
  titleText: { fontFamily: fonts.display, fontWeight: '700', fontSize: 18, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: '86%', height: '86%', borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 2, borderColor: colors.blueOutline },
  on: { backgroundColor: colors.accent, borderColor: colors.accent },
  years: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  year: { width: 72, height: 40, borderRadius: radius.pill, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
