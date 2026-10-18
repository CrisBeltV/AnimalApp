import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { REMIND_OPTIONS, formatDate, parseDate } from '../lib/health';
import type { Field } from '../lib/health';
import { canNotify, scheduleAt, scheduleEvery } from '../lib/notify';
import { pickPhoto } from '../lib/photo';
import { useStore } from '../lib/store';
import { colors, fonts, radius, shadow } from '../lib/theme';
import type { Reminder } from '../lib/types';
import { Icon } from './Icon';
import { Button, Card, T } from './ui';

// Piezas compartidas por las ventanas que registran datos de salud.

export function Input({
  field,
  value,
  onChange,
  missing,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  missing?: boolean;
}) {
  const badDate = field.date && value.trim() !== '' && parseDate(value) === null;
  return (
    <View style={{ gap: 6 }}>
      <View style={s.labelRow}>
        <T.Black style={{ flex: 1 }}>
          {field.label}
          {field.required ? <Text style={{ color: colors.lostText }}> *</Text> : null}
        </T.Black>
        {field.date && (
          <Pressable onPress={() => onChange(formatDate(Date.now()))} style={s.chip}>
            <T.Black style={{ fontSize: 13 }}>Hoy</T.Black>
          </Pressable>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={field.number ? 'number-pad' : field.date ? 'numbers-and-punctuation' : 'default'}
        multiline={field.multiline}
        style={[
          s.input,
          field.multiline && { minHeight: 72, paddingTop: 12, textAlignVertical: 'top' },
          (missing || badDate) && { borderColor: colors.lost, backgroundColor: colors.lostSoft },
        ]}
      />
      {badDate ? <T.Muted style={{ color: colors.lostText, fontSize: 13 }}>Escribe la fecha como DD/MM/AAAA</T.Muted> : null}
      {missing ? <T.Muted style={{ color: colors.lostText, fontSize: 13 }}>Falta este dato</T.Muted> : null}
    </View>
  );
}

// Dos fotos: frente y reverso del carnet o de la caja.
export function PhotoPair({ photos, onChange, sides }: { photos: string[]; onChange: (p: string[]) => void; sides: [string, string] }) {
  const [asking, setAsking] = useState<number | null>(null);
  const take = async (i: number, source: 'camara' | 'galeria') => {
    setAsking(null);
    const uri = await pickPhoto(source);
    if (!uri) return;
    const next = [...photos];
    next[i] = uri;
    onChange(next);
  };
  return (
    <View style={s.photoRow}>
      {sides.map((label, i) => (
        <View key={label} style={{ flex: 1, gap: 6 }}>
          <Pressable
            accessibilityLabel={`Foto: ${label}`}
            onPress={() => setAsking(asking === i ? null : i)}
            style={[s.photo, photos[i] ? { borderStyle: 'solid' } : null]}
          >
            {photos[i] ? (
              <Image source={{ uri: photos[i] }} style={s.photoImg} resizeMode="cover" />
            ) : (
              <>
                <Icon name="camara" size={28} color={colors.accent} />
                <T.Black style={{ fontSize: 14, textAlign: 'center' }}>{label}</T.Black>
              </>
            )}
          </Pressable>
          {asking === i && (
            <View style={{ gap: 6 }}>
              <Button label="Tomar foto" onPress={() => take(i, 'camara')} />
              <Button label="Elegir de la galería" kind="secondary" onPress={() => take(i, 'galeria')} />
              {photos[i] ? (
                <Button
                  label="Quitar foto"
                  kind="lost"
                  onPress={() => {
                    setAsking(null);
                    const next = [...photos];
                    next[i] = '';
                    onChange(next);
                  }}
                />
              ) : null}
            </View>
          )}
          {photos[i] && asking !== i ? <T.Muted style={{ fontSize: 12, textAlign: 'center' }}>{label} · toca para cambiar</T.Muted> : null}
        </View>
      ))}
    </View>
  );
}

// Borrar con confirmación dentro de la misma ventana.
export function DeleteEntry({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <Button label="Borrar este registro" kind="lost" onPress={() => setConfirm(true)} />;
  return (
    <Card style={{ gap: 10, borderWidth: 2, borderColor: colors.lost }}>
      <T.Black>¿Seguro que quieres borrarlo? También se borran sus recordatorios.</T.Black>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setConfirm(false)} />
        <Button label="Sí, borrar" kind="lost" style={{ flex: 1 }} onPress={onDelete} />
      </View>
    </Card>
  );
}

export type RemindTarget = { title: string; at: number };

// Al terminar un registro con fechas: "¿Quieres agendar un recordatorio?" Sí / No.
// Con Sí se eligen 1 día, 1 semana y/o 1 mes antes (una o todas a la vez).
export function ReminderSheet({
  entryId,
  petName,
  targets,
  every,
  onDone,
}: {
  entryId: string | null;
  petName: string;
  targets: RemindTarget[];
  every?: { title: string; hours: number; start: number };
  onDone: () => void;
}) {
  const { addReminders } = useStore();
  const [step, setStep] = useState<'pregunta' | 'elegir'>('pregunta');
  const [chosen, setChosen] = useState<string[]>([]);
  const [doses, setDoses] = useState(false);
  const visible = entryId !== null;

  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const save = async () => {
    const list: Omit<Reminder, 'id'>[] = [];
    for (const t of targets) {
      for (const o of REMIND_OPTIONS) {
        if (!chosen.includes(o.id)) continue;
        const at = t.at - o.days * 86400000 + 9 * 3600000; // a las 9 de la mañana
        if (at <= Date.now()) continue;
        const title = `${t.title} · ${o.label}`;
        const notificationId = await scheduleAt(`${petName}: ${t.title}`, `${o.label} (${formatDate(t.at)})`, at);
        list.push({ entryId: entryId!, title, at, notificationId });
      }
    }
    if (every && doses) {
      const notificationId = await scheduleEvery(`${petName}: ${every.title}`, `Toca la siguiente toma (cada ${every.hours} h)`, every.hours);
      list.push({ entryId: entryId!, title: `${every.title} · cada ${every.hours} h`, at: every.start, everyHours: every.hours, notificationId });
    }
    addReminders(list);
    onDone();
  };

  const nothingLeft = (days: number) => targets.every((t) => t.at - days * 86400000 + 9 * 3600000 <= Date.now());

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDone}>
      <View style={s.backdrop}>
        <View style={[s.sheet, shadow]}>
          <View style={s.bell}>
            <Icon name="reloj" size={26} color={colors.accent} />
          </View>
          {step === 'pregunta' ? (
            <>
              <T.Display style={{ fontSize: 22, textAlign: 'center' }}>¿Quieres agendar un recordatorio?</T.Display>
              <View style={{ gap: 4 }}>
                {targets.map((t) => (
                  <T.Bold key={t.title} style={{ textAlign: 'center' }}>
                    {t.title}: {formatDate(t.at)}
                  </T.Bold>
                ))}
                {every ? (
                  <T.Bold style={{ textAlign: 'center' }}>
                    {every.title}: cada {every.hours} horas
                  </T.Bold>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button label="No" kind="secondary" style={{ flex: 1 }} onPress={onDone} />
                <Button label="Sí" kind="solid" style={{ flex: 1 }} onPress={() => setStep('elegir')} />
              </View>
            </>
          ) : (
            <>
              <T.Display style={{ fontSize: 22, textAlign: 'center' }}>¿Cuándo te aviso?</T.Display>
              {targets.length > 0 && <T.Muted style={{ textAlign: 'center' }}>Puedes elegir una o todas</T.Muted>}
              {targets.length > 0 &&
                REMIND_OPTIONS.map((o) => {
                  const off = nothingLeft(o.days);
                  return (
                    <Check
                      key={o.id}
                      label={o.label}
                      detail={off ? 'Esa fecha ya pasó' : undefined}
                      on={chosen.includes(o.id)}
                      disabled={off}
                      onPress={() => toggle(o.id)}
                    />
                  );
                })}
              {every ? <Check label={`Avisarme en cada toma (cada ${every.hours} h)`} on={doses} onPress={() => setDoses(!doses)} /> : null}
              {!canNotify && (
                <T.Muted style={{ fontSize: 13, textAlign: 'center' }}>
                  En esta vista web el aviso queda en la lista de Salud. En el teléfono llegará como notificación.
                </T.Muted>
              )}
              <Button label="Agendar" kind="solid" disabled={chosen.length === 0 && !doses} onPress={save} />
              <Button label="Ahora no" kind="secondary" onPress={onDone} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function Check({
  label,
  detail,
  on,
  disabled,
  onPress,
}: {
  label: string;
  detail?: string;
  on: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[s.check, on && { backgroundColor: colors.blue, borderColor: colors.blueOutline }, disabled && { opacity: 0.45 }]}
    >
      <View style={[s.box, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
        {on ? <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14 }}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T.Black style={{ fontSize: 15 }}>{label}</T.Black>
        {detail ? <T.Muted style={{ fontSize: 12 }}>{detail}</T.Muted> : null}
      </View>
    </Pressable>
  );
}

// Al guardar: si no hay fechas para recordar, se vuelve atrás de una vez.
export function finish() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

const s = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: colors.blue,
    borderWidth: 1.5,
    borderColor: colors.blueOutline,
    justifyContent: 'center',
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.grey,
    paddingHorizontal: 14,
    fontSize: 17,
    fontFamily: fonts.body,
    color: colors.body,
  },
  photoRow: { flexDirection: 'row', gap: 10 },
  photo: {
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.blueOutline,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
    padding: 8,
  },
  photoImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 28, padding: 20, gap: 12 },
  bell: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.grey,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.blueOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
