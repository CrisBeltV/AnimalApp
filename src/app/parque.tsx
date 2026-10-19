import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Check, Input } from '../components/form';
import { BackHeader, Bar, Button, Card, EntryRow, T, when } from '../components/ui';
import { PARK_BADGES, PARK_FEATURES, parkStats } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';

// Ficha del parque: insignias, visitas, lo que tiene y tu calificación.
export default function Parque() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, savePark, removePark } = useStore();
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

  const st = parkStats(data.entries, park.id);
  const update = (patch: Partial<typeof park>) => savePark({ ...park, ...patch });
  const toggle = (f: string) => {
    const list = park.features ?? [];
    update({ features: list.includes(f) ? list.filter((x) => x !== f) : [...list, f] });
  };
  const changed = name.trim() !== park.name || barrio.trim() !== (park.barrio ?? '') || note.trim() !== (park.note ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={park.name} subtitle={park.barrio} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 48 }}>{st.badge?.icon ?? '🌳'}</Text>
          <Text style={s.big}>{st.minutes} min</Text>
          <T.Muted>
            {st.visits.length} {st.visits.length === 1 ? 'visita' : 'visitas'}
            {st.first ? ` · desde ${when(st.first)}` : ''}
          </T.Muted>
          <View style={{ alignSelf: 'stretch', gap: 8 }}>
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
                  <Bar value={(st.minutes / b.min) * 100} color={st.minutes >= b.min ? colors.found : colors.accent} />
                </View>
              ))}
          </View>
        </Card>

        <Button
          label={`Iniciar paseo aquí con ${pet.name}`}
          kind="solid"
          onPress={() => {
            router.push({ pathname: '/paseo', params: { parque: park.id } });
          }}
        />

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

        <Card style={{ gap: 4 }}>
          <T.Black>Paseos aquí</T.Black>
          {st.visits.length === 0 ? (
            <T.Muted>Todavía no hay paseos en este parque.</T.Muted>
          ) : (
            st.visits.slice(0, 10).map((e) => <EntryRow key={e.id} entry={e} species={pet.species} />)
          )}
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
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 32, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
