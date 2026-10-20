import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PERIODS, activityEntries, change, dayLabel, hm, minutesByDay, monthName, monthly, periodStats } from '../lib/activity';
import { WALK_TYPES, startOfDay } from '../lib/game';
import { colors, fonts } from '../lib/theme';
import type { AppData } from '../lib/types';
import { T } from './ui';

const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 18;
const SHADES = [colors.grey, '#D6EAFB', '#BFD7F1', '#7FA6D6', colors.accent];
const shade = (min: number) => (min <= 0 ? 0 : min < 15 ? 1 : min < 30 ? 2 : min < 60 ? 3 : 4);
const ROWS = ['L', '', 'M', '', 'V', '', 'D'];

// Tiempos acumulados de actividad, como un registro de práctica: calendario por días,
// días y horas del periodo comparados con el anterior, y totales por mes. Solo datos.
export function ActivityStats({ data, now }: { data: AppData; now: number }) {
  const [tipo, setTipo] = useState('todas');
  const [period, setPeriod] = useState(90);
  const [menu, setMenu] = useState<'tipo' | 'periodo' | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const list = activityEntries(data.entries, tipo);
  const st = periodStats(list, now, period);
  const byDay = minutesByDay(list);
  const months = monthly(list, now);
  const types = [{ id: 'todas', label: 'Todas las actividades' }, ...WALK_TYPES];
  const tipoLabel = types.find((x) => x.id === tipo)?.label ?? 'Todas';

  // Calendario: 18 semanas de lunes a domingo, la última es la de hoy.
  const today = startOfDay(now);
  const monday = today - ((new Date(today).getDay() + 6) % 7) * DAY;
  const first = monday - (WEEKS - 1) * 7 * DAY;
  const weeks = Array.from({ length: WEEKS }, (_, w) => Array.from({ length: 7 }, (_, d) => first + (w * 7 + d) * DAY));

  const byType = WALK_TYPES.map((w) => {
    const items = activityEntries(data.entries, w.id).filter((e) => e.at >= st.start);
    return { ...w, count: items.length, minutes: items.reduce((s, e) => s + (e.minutes ?? 0), 0) };
  })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.minutes - a.minutes);
  const byPark = data.parks
    .map((p) => {
      const items = list.filter((e) => e.fields?.parqueId === p.id && e.at >= st.start);
      return { name: p.name, count: items.length, minutes: items.reduce((s, e) => s + (e.minutes ?? 0), 0) };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.minutes - a.minutes);

  return (
    <View style={{ gap: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Actividad: ${tipoLabel}`} onPress={() => setMenu(menu === 'tipo' ? null : 'tipo')} style={s.select}>
        <T.Black style={{ flex: 1, textAlign: 'center' }}>{tipoLabel}</T.Black>
        <T.Black style={{ color: colors.textMuted }}>▾</T.Black>
      </Pressable>
      {menu === 'tipo' ? (
        <View style={s.menu}>
          {types.map((x) => (
            <Option key={x.id} label={x.label} on={x.id === tipo} onPress={() => (setTipo(x.id), setMenu(null))} />
          ))}
        </View>
      ) : null}

      <View style={s.card}>
        <View style={s.head}>
          <T.Eyebrow style={{ flex: 1 }}>TIEMPO ACUMULADO</T.Eyebrow>
          <Pressable accessibilityRole="button" accessibilityLabel={`Periodo: ${period} días`} onPress={() => setMenu(menu === 'periodo' ? null : 'periodo')} style={s.period}>
            <T.Black style={{ fontSize: 13 }}>{period} días ▾</T.Black>
          </Pressable>
        </View>
        {menu === 'periodo' ? (
          <View style={s.menu}>
            {PERIODS.map((p) => (
              <Option key={p} label={`${p} días`} on={p === period} onPress={() => (setPeriod(p), setMenu(null))} />
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={{ gap: 2, paddingTop: 16 }}>
            {ROWS.map((r, i) => (
              <Text key={i} style={s.rowLabel}>
                {r}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
            {weeks.map((week, w) => {
              const startsMonth = w === 0 || new Date(week[0]).getMonth() !== new Date(weeks[w - 1][0]).getMonth();
              return (
                <View key={w} style={{ flex: 1, gap: 2 }}>
                  <View style={{ height: 14, overflow: 'visible' }}>
                    {startsMonth ? <Text style={s.month}>{monthName(week[0])}</Text> : null}
                  </View>
                  {week.map((day) => {
                    const min = byDay.get(day) ?? 0;
                    const future = day > today;
                    return (
                      <Pressable
                        key={day}
                        accessibilityLabel={`${hm(min)} el ${dayLabel(day)}`}
                        disabled={future}
                        onPress={() => setPicked(picked === day ? null : day)}
                        style={[
                          s.cell,
                          { backgroundColor: future ? 'transparent' : SHADES[shade(min)] },
                          picked === day && { borderWidth: 2, borderColor: colors.text },
                        ]}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
        <View style={s.legend}>
          <T.Muted style={{ fontSize: 12 }}>menos</T.Muted>
          {SHADES.map((c) => (
            <View key={c} style={[s.legendCell, { backgroundColor: c }]} />
          ))}
          <T.Muted style={{ fontSize: 12 }}>más</T.Muted>
        </View>
        {picked !== null ? (
          <View style={s.tip}>
            <Text style={s.tipText}>
              {hm(byDay.get(picked) ?? 0)} el {dayLabel(picked)}
            </Text>
          </View>
        ) : (
          <T.Muted style={{ fontSize: 12, textAlign: 'center' }}>Toca un día para ver su tiempo</T.Muted>
        )}
      </View>

      <View style={s.card}>
        <Metric title="Días con actividad" value={`${st.days} d`} sub={`${period} días`} pct={change(st.days, st.prev.days)} />
        <Metric title="Tiempo acumulado" value={hm(st.minutes)} sub={`${period} días`} pct={change(st.minutes, st.prev.minutes)} />
        <Metric title="Número de actividades" value={`${st.count}`} sub={`${period} días`} pct={change(st.count, st.prev.count)} />
      </View>

      <View style={s.card}>
        <T.Black>Minutos por día</T.Black>
        <Bars values={st.daily} back={st.prevDaily} height={100} />
        <View style={s.legend}>
          <View style={[s.legendCell, { backgroundColor: colors.accent }]} />
          <T.Muted style={{ fontSize: 12 }}>últimos {period} días</T.Muted>
          <View style={[s.legendCell, { backgroundColor: colors.grey, marginLeft: 10 }]} />
          <T.Muted style={{ fontSize: 12 }}>{period} días anteriores</T.Muted>
        </View>
      </View>

      <View style={s.card}>
        <T.Black>Días con actividad por mes</T.Black>
        <Bars values={months.map((m) => m.days)} labels={months.map((m) => m.label)} height={80} showValues />
        <T.Black>Horas por mes</T.Black>
        <Bars values={months.map((m) => Math.round((m.minutes / 60) * 10) / 10)} labels={months.map((m) => m.label)} height={80} showValues />
      </View>

      <View style={s.card}>
        <T.Eyebrow>MÁS FRECUENTE · {period} DÍAS</T.Eyebrow>
        {byType.length === 0 ? <T.Muted style={{ fontSize: 13 }}>Todavía no hay datos en este periodo.</T.Muted> : null}
        {byType.map((x) => (
          <Row key={x.id} label={x.label} detail={`${x.count} ${x.count === 1 ? 'vez' : 'veces'} · ${hm(x.minutes)}`} />
        ))}
        {byPark.length ? <T.Eyebrow style={{ marginTop: 6 }}>PARQUES</T.Eyebrow> : null}
        {byPark.map((x) => (
          <Row key={x.name} label={`🌳 ${x.name}`} detail={`${x.count} ${x.count === 1 ? 'vez' : 'veces'} · ${hm(x.minutes)}`} />
        ))}
      </View>
    </View>
  );
}

function Option({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress} style={s.option}>
      <T.Bold style={{ flex: 1 }}>{label}</T.Bold>
      <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
    </Pressable>
  );
}

function Metric({ title, value, sub, pct }: { title: string; value: string; sub: string; pct: number | null }) {
  return (
    <View style={{ gap: 2 }}>
      <T.Muted>{title}</T.Muted>
      <Text style={s.big}>
        {value} <Text style={s.bigSub}>{sub}</Text>
      </Text>
      {pct !== null ? (
        <T.Black style={{ fontSize: 13, color: pct < 0 ? colors.lostText : colors.foundText }}>
          {pct > 0 ? '+' : ''}
          {pct} % <T.Muted style={{ fontSize: 12 }}>frente al periodo anterior</T.Muted>
        </T.Black>
      ) : (
        <T.Muted style={{ fontSize: 12 }}>Sin datos del periodo anterior para comparar</T.Muted>
      )}
    </View>
  );
}

function Bars({ values, back, labels, height, showValues }: { values: number[]; back?: number[]; labels?: string[]; height: number; showValues?: boolean }) {
  const max = Math.max(1, ...values, ...(back ?? []));
  return (
    <View style={{ gap: 4 }}>
      <View style={[s.bars, { height }]}>
        <Text style={s.axis}>{Math.round(max * 10) / 10}</Text>
        {values.map((v, i) => (
          <View key={i} style={s.barCol}>
            {back ? <View style={[s.bar, s.barBack, { height: (back[i] / max) * height }]} /> : null}
            {showValues && v > 0 ? <Text style={s.barValue}>{v}</Text> : null}
            <View style={[s.bar, { height: Math.max(v > 0 ? 3 : 0, (v / max) * height) }]} />
          </View>
        ))}
      </View>
      {labels ? (
        <View style={{ flexDirection: 'row' }}>
          {labels.map((l, i) => (
            <Text key={i} style={[s.barLabel, { flex: 1 }]}>
              {i % 3 === 0 || i === labels.length - 1 ? l : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={s.row}>
      <T.Black style={{ flex: 1, fontSize: 15 }}>{label}</T.Black>
      <T.Muted style={{ fontSize: 13 }}>{detail}</T.Muted>
    </View>
  );
}

const s = StyleSheet.create({
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.blueOutline,
  },
  menu: { backgroundColor: colors.card, borderRadius: 16, paddingVertical: 4, borderWidth: 1.5, borderColor: colors.grey },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, paddingHorizontal: 14 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.accent },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 14, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  period: { height: 34, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colors.grey, justifyContent: 'center' },
  rowLabel: { height: 14, fontSize: 10, lineHeight: 14, color: colors.textMuted, fontFamily: fonts.bodyBold, fontWeight: '700' },
  month: { position: 'absolute', left: 0, top: 0, width: 40, fontSize: 10, lineHeight: 14, color: colors.textMuted, fontFamily: fonts.bodyBold, fontWeight: '700' },
  cell: { height: 14, borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
  tip: { alignSelf: 'center', backgroundColor: colors.text, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  tipText: { color: '#FFFFFF', fontSize: 13, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 28, color: colors.text },
  bigSub: { fontFamily: fonts.bodyBold, fontWeight: '700', fontSize: 13, color: colors.textMuted },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 1, borderBottomWidth: 1, borderBottomColor: colors.grey, paddingTop: 14 },
  axis: { position: 'absolute', left: 0, top: 0, fontSize: 10, color: colors.textMuted, fontFamily: fonts.bodyBold, fontWeight: '700' },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '80%', maxWidth: 18, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: colors.accent },
  barBack: { position: 'absolute', bottom: 0, backgroundColor: colors.grey },
  barValue: { fontSize: 10, color: colors.text, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  barLabel: { fontSize: 10, textAlign: 'center', color: colors.textMuted, fontFamily: fonts.bodyBold, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.grey },
});
