import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DeleteEntry, Input, PhotoSet, ProviderPicker, ReminderSheet, finish } from '../components/form';
import type { RemindTarget } from '../components/form';
import { BackHeader, Button, Card, T, soon } from '../components/ui';
import { KIND_INFO } from '../lib/game';
import { FICHAS, fichaKind, formatDate, parseDate } from '../lib/health';
import { foodStatus } from '../lib/game';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// Ficha de vacuna o medicamento: fotos por ambos lados, datos separados,
// vista previa antes de guardar y recordatorios al final.
export default function Ficha() {
  const params = useLocalSearchParams<{ tipo?: string; id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const editing = data.entries.find((e) => e.id === params.id);
  const kind = fichaKind(editing?.kind ?? params.tipo);
  const ficha = FICHAS[kind];
  const fields = ficha.fields;
  const vaccine = kind === 'vacuna';
  const food = kind === 'alimento';
  const pet = data.pet!;

  const [values, setValues] = useState<Record<string, string>>((): Record<string, string> => {
    if (editing?.fields) return { ...editing.fields };
    // Registros viejos solo tenían una nota: se usa como nombre.
    if (editing) return { nombre: editing.note ?? '', [ficha.dateKey]: formatDate(editing.at) };
    return food ? { comidasDia: '2' } : {};
  });
  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []);
  const [step, setStep] = useState<'datos' | 'revisar'>('datos');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [targets, setTargets] = useState<RemindTarget[]>([]);
  const [every, setEvery] = useState<{ title: string; hours: number; start: number } | undefined>();

  const groupStart = (i: number) => !!fields[i].group && fields[i - 1]?.group !== fields[i].group;
  const set = (k: string) => (v: string) => setValues((x) => ({ ...x, [k]: v }));
  const val = (k: string) => (values[k] ?? '').trim();
  const missing = fields.filter((f) => f.required && (!val(f.key) || (f.date && parseDate(val(f.key)) === null)));
  const badDates = fields.filter((f) => f.date && val(f.key) && parseDate(val(f.key)) === null);
  const title = editing ? `Editar ${KIND_INFO[kind].label.toLowerCase()}` : ficha.newTitle;

  const save = () => {
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    const day = parseDate(val(ficha.dateKey)) ?? Date.now();
    const sameDay = new Date(day).toDateString() === new Date().toDateString();
    const at = sameDay ? Date.now() : day + 12 * 3600000;
    const entry = { fields: clean, photos: photos.filter(Boolean), note: clean.nombre, at };
    let id: string;
    if (editing) {
      updateEntry(editing.id, entry);
      id = editing.id;
    } else {
      id = addEntry({ kind, ...entry });
    }

    const dated = fields
      .filter((f) => f.remind)
      .map((f) => ({ title: `${f.remind}: ${clean.nombre}`, at: parseDate(clean[f.key]) ?? 0 }))
      .filter((t) => t.at > Date.now());
    if (food) {
      // Fecha estimada en que se acaba, según el empaque y la porción diaria.
      const out = foodStatus([{ id, kind, at, xp: 0, fields: clean }], Date.now())?.runsOut;
      if (out && out > Date.now()) dated.push({ title: `Se acaba ${clean.nombre}`, at: out });
    }
    const hours = Number(clean.cadaHoras);
    const doses = kind === 'medicamento' && hours > 0 ? { title: `Toma de ${clean.nombre}`, hours, start: at } : undefined;
    const already = data.reminders.some((r) => r.entryId === id);
    if (!already && (dated.length > 0 || doses)) {
      setTargets(dated);
      setEvery(doses);
      setSavedId(id);
    } else {
      finish();
    }
  };

  const reading = () =>
    soon(
      'Lectura automática',
      `Pronto la app leerá las fotos del ${vaccine ? 'carnet' : 'empaque'} y llenará los datos sola: ${food ? 'marca, tipo, ingredientes, porción recomendada y fecha de caducidad' : 'nombre, cantidad, ingredientes, fechas y más'}. Necesita un servicio en internet que se conectará en la siguiente etapa. Por ahora escribe los datos a mano; las fotos quedan guardadas con el registro.`,
    );
  const lookup = (label: string) =>
    soon(
      'Completar desde internet',
      `Pronto podrás llenar "${label}" con información general de internet. La app mostrará siempre de dónde sacó el dato para que puedas revisarlo. Lo que diga tu veterinario va primero.`,
    );

  if (step === 'revisar') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader title="Revisa los datos" subtitle={`${ficha.what} de ${pet.name}`} onBack={() => setStep('datos')} />
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
          {missing.length > 0 && (
            <Card style={{ gap: 12, borderWidth: 2, borderColor: colors.lost }}>
              <T.Black>Faltan datos importantes. Complétalos ahora para terminar el registro.</T.Black>
              {missing.map((f) => (
                <Input key={f.key} field={f} value={values[f.key] ?? ''} onChange={set(f.key)} missing />
              ))}
            </Card>
          )}
          {photos.some(Boolean) && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {photos.filter(Boolean).map((p, i) => (
                <Image key={i} source={{ uri: p }} style={s.thumb} resizeMode="cover" />
              ))}
            </View>
          )}
          <Card style={{ gap: 2 }}>
            {fields.map((f, i) => (
              <View key={f.key}>
                {groupStart(i) ? <T.Black style={s.groupHead}>{f.group}</T.Black> : null}
                <View style={[s.previewRow, f.group ? s.tableRow : null]}>
                  <T.Muted style={{ fontSize: 13, flex: f.group ? 1 : undefined }}>{f.label}</T.Muted>
                  <T.Black style={{ color: val(f.key) ? colors.text : colors.textMuted, fontSize: 15 }}>
                    {val(f.key) || 'Sin dato'}
                  </T.Black>
                </View>
              </View>
            ))}
          </Card>
          <Button label="Completar o corregir datos" onPress={() => setStep('datos')} />
          <Button label={editing ? 'Guardar cambios' : 'Terminar registro'} kind="solid" disabled={missing.length > 0 || badDates.length > 0} onPress={save} />
        </ScrollView>
        <ReminderSheet entryId={savedId} petName={pet.name} targets={targets} every={every} onDone={finish} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={title} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 10 }}>
          <T.Black>{ficha.photosTitle}</T.Black>
          <T.Muted style={{ fontSize: 13 }}>Toma una foto de cada lado. Quedan guardadas con el registro.</T.Muted>
          <PhotoSet photos={photos} onChange={setPhotos} sides={ficha.sides} />
          <Button label="Leer los datos de las fotos" kind="secondary" disabled={!photos.some(Boolean)} onPress={reading} />
        </Card>

        <T.Muted>Escribe los datos. Los marcados con * son necesarios.</T.Muted>
        {fields.map((f, i) => (
          <View key={f.key} style={{ gap: 4 }}>
            {groupStart(i) ? (
              <View style={{ marginTop: 6, gap: 2 }}>
                <T.Black style={{ fontSize: 17 }}>{f.group}</T.Black>
                <T.Muted style={{ fontSize: 13 }}>Copia los valores del "análisis garantizado" de la bolsa. Sirven para el balance de cada comida.</T.Muted>
              </View>
            ) : null}
            <Input field={f} value={values[f.key] ?? ''} onChange={set(f.key)} />
            {f.lookup && (
              <Pressable onPress={() => lookup(f.label)} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
                <T.Black style={{ fontSize: 13, color: colors.accent }}>Completar desde internet</T.Black>
              </Pressable>
            )}
          </View>
        ))}
        {food && (
          <Card style={{ gap: 10 }}>
            <T.Black>¿Dónde lo compras?</T.Black>
            <ProviderPicker type="tienda" value={values.tiendaId} onChange={(id) => setValues((x) => ({ ...x, tiendaId: id ?? '' }))} />
          </Card>
        )}
        <Button label="Revisar antes de guardar" kind="solid" onPress={() => setStep('revisar')} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  thumb: { flex: 1, height: 110, borderRadius: 16, backgroundColor: colors.grey },
  groupHead: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10, backgroundColor: colors.lilacSoft, fontSize: 15 },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  previewRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.grey, gap: 2 },
});
