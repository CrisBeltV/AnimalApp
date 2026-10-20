import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Check, Input } from '../components/form';
import { Icon } from '../components/Icon';
import { Island } from '../components/Island';
import { BackHeader, Bar, Button, Card, T, when } from '../components/ui';
import { PARK_BADGES, PARK_FEATURES, WALK_TYPES } from '../lib/game';
import { formatDate } from '../lib/health';
import { CONQUER_MIN, conquestHint, parkInfo } from '../lib/parks';
import { distanceText } from '../lib/reports';
import { OwnerPill, Tiles } from './parques';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';

// Ficha del parque: la isla, cuánto falta para conquistarlo, tu historia aquí, lo que tiene y tu calificación.
export default function Parque() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, savePark, removePark } = useStore();
  const insets = useSafeAreaInsets();
  const [now] = useState(() => Date.now());
  const pet = data.pet!;
  const park = data.parks.find((p) => p.id === id);
  const [name, setName] = useState(park?.name ?? '');
  const [barrio, setBarrio] = useState(park?.barrio ?? '');
  const [note, setNote] = useState(park?.note ?? '');
  const [confirm, setConfirm] = useState(false);

  if (!park) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader title="Parque" />
        <T.Muted style={{ padding: 16 }}>Este parque ya no existe.</T.Muted>
      </View>
    );
  }

  const info = parkInfo(data, park, now);
  const st = info;
  const update = (patch: Partial<typeof park>) => savePark({ ...park, ...patch });
  const toggle = (f: string) => {
    const list = park.features ?? [];
    update({ features: list.includes(f) ? list.filter((x) => x !== f) : [...list, f] });
  };
  const changed = name.trim() !== park.name || barrio.trim() !== (park.barrio ?? '') || note.trim() !== (park.note ?? '');
  const typeLabel = (t?: string) => WALK_TYPES.find((w) => w.id === (t ?? 'paseo'))?.label ?? 'Paseo';

  return (
    <View style={{ flex: 1, backgroundColor: colors.blueTint }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} keyboardShouldPersistTaps="handled">
        <View style={[s.hero, { paddingTop: insets.top + 10 }]}>
          <Pressable accessibilityLabel="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parques'))} style={s.back}>
            <Icon name="atras" size={22} strokeWidth={2.4} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Island size={190} flag={info.status === 'mio'} />
          </View>
        </View>
        <View style={s.sheet}>
          <View style={{ gap: 2 }}>
            <T.Display style={{ fontSize: 26 }}>{park.name}</T.Display>
            <T.Muted>{[`A ${distanceText(info.distance)}`, park.barrio].filter(Boolean).join(' · ')}</T.Muted>
          </View>

          <View style={{ gap: 6 }}>
            <View style={s.row}>
              <T.Black>Conquista</T.Black>
              <OwnerPill status={info.status} />
            </View>
            <Bar value={info.pct} color={colors.accent} />
            <View style={s.row}>
              <T.Muted style={{ fontSize: 13 }}>
                {Math.min(info.month, CONQUER_MIN)} de {CONQUER_MIN} min este mes
              </T.Muted>
              <T.Black style={{ fontSize: 13, color: colors.accent }}>{info.pct} %</T.Black>
            </View>
            <T.Muted style={{ fontSize: 13 }}>{conquestHint(info)}</T.Muted>
          </View>

          <Tiles info={info} bg="#FFFFFF" />

          <View style={{ gap: 8 }}>
            <Text style={s.eyebrow}>TU HISTORIA AQUÍ</Text>
            {st.visits.length === 0 ? (
              <T.Muted>Todavía no hay paseos en este parque.</T.Muted>
            ) : (
              st.visits.slice(0, 8).map((e) => (
                <View key={e.id} style={s.story}>
                  <T.Muted style={{ width: 92, fontSize: 13 }}>{formatDate(e.at)}</T.Muted>
                  <T.Bold style={{ flex: 1 }} numberOfLines={1}>
                    {typeLabel(e.fields?.tipo)} con {pet.name}
                  </T.Bold>
                  <T.Black style={{ color: colors.accent }}>+{Math.round(e.minutes ?? 0)} min</T.Black>
                </View>
              ))
            )}
            {st.visits.length ? (
              <T.Muted style={{ fontSize: 12 }}>
                {st.minutes} min en total · {st.visits.length} {st.visits.length === 1 ? 'visita' : 'visitas'}
                {st.first ? ` · desde ${when(st.first)}` : ''}
              </T.Muted>
            ) : null}
          </View>

          <View style={[s.friends]}>
            <Text style={{ fontSize: 22 }}>🐕🐈🐕</Text>
            <T.Muted style={{ flex: 1, fontSize: 13 }}>Muy pronto verás qué mascotas del barrio también pasean aquí.</T.Muted>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={s.eyebrow}>INSIGNIAS</Text>
            {PARK_BADGES.slice()
              .reverse()
              .map((b) => (
                <View key={b.label} style={{ gap: 4 }}>
                  <View style={s.row}>
                    <T.Bold>
                      {b.icon} {b.label}
                    </T.Bold>
                    <T.Muted style={{ fontSize: 13 }}>{st.minutes >= b.min ? 'Conseguida' : `${b.min - st.minutes} min más`}</T.Muted>
                  </View>
                  <Bar value={(st.minutes / b.min) * 100} color={st.minutes >= b.min ? colors.found : colors.lilacStrong} />
                </View>
              ))}
          </View>

        <Card style={{ gap: 8 }}>
          <T.Black>¿Qué tiene este parque?</T.Black>
          {PARK_FEATURES.map((f) => (
            <Check key={f.id} label={f.label} on={(park.features ?? []).includes(f.id)} onPress={() => toggle(f.id)} />
          ))}
        </Card>

        <Card style={{ gap: 8 }}>
          <T.Black>Tu calificación</T.Black>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} accessibilityLabel={`${n} estrellas`} onPress={() => update({ rating: n })}>
                <Text style={{ fontSize: 32, color: (park.rating ?? 0) >= n ? '#F2B22E' : colors.grey }}>★</Text>
              </Pressable>
            ))}
          </View>
          <T.Muted style={{ fontSize: 12 }}>Muy pronto verás las reseñas y retos de otros dueños del barrio.</T.Muted>
        </Card>

        <Card style={{ gap: 10 }}>
          <T.Black>Datos del parque</T.Black>
          <Input field={{ key: 'nombre', label: 'Nombre', required: true }} value={name} onChange={setName} />
          <Input field={{ key: 'barrio', label: 'Barrio', placeholder: 'Villa Luz' }} value={barrio} onChange={setBarrio} />
          <Input field={{ key: 'nota', label: 'Notas', placeholder: 'Mejor hora, cuidado con…', multiline: true }} value={note} onChange={setNote} />
          <Button
            label="Guardar cambios"
            disabled={!changed || !name.trim()}
            onPress={() => update({ name: name.trim(), barrio: barrio.trim() || undefined, note: note.trim() || undefined })}
          />
        </Card>

        {confirm ? (
          <Card style={{ gap: 10, borderWidth: 2, borderColor: colors.lost }}>
            <T.Black>¿Borrar este parque? Los paseos se conservan, pero ya no sumarán a este parque.</T.Black>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setConfirm(false)} />
              <Button
                label="Sí, borrar"
                kind="lost"
                style={{ flex: 1 }}
                onPress={() => {
                  removePark(park.id);
                  router.back();
                }}
              />
            </View>
          </Card>
        ) : (
          <Button label="Borrar parque" kind="lost" onPress={() => setConfirm(true)} />
        )}
        </View>
      </ScrollView>
      <View style={[s.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Button label="Ir a pasear aquí" kind="solid" onPress={() => router.push({ pathname: '/paseo', params: { parque: park.id } })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.blueTint, paddingHorizontal: 16, paddingBottom: 6 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    minHeight: 600,
  },
  eyebrow: { fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8 },
  story: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  friends: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.lilacSoft, borderRadius: 16, padding: 12 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, backgroundColor: 'rgba(243,245,248,0.95)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
