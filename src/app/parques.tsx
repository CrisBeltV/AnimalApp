import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, Bar, Button, Card, T, soon, when } from '../components/ui';
import { NEW_PARK_XP, PARK_BADGES, parkStats } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';

// Conquista de parques: todos tus parques, sus minutos e insignias.
export default function Parques() {
  const { data, savePark } = useStore();
  const pet = data.pet!;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [barrio, setBarrio] = useState('');
  const parks = data.parks
    .map((p) => ({ park: p, ...parkStats(data.entries, p.id) }))
    .sort((a, b) => b.minutes - a.minutes);
  const conquered = parks.filter((p) => p.badge).length;
  const total = parks.reduce((s, p) => s + p.minutes, 0);

  const add = () => {
    const id = savePark({ name: name.trim(), barrio: barrio.trim() || undefined });
    setAdding(false);
    setName('');
    setBarrio('');
    router.push({ pathname: '/parque', params: { id } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Parques" subtitle={`Conquista de parques con ${pet.name}`} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.stats}>
          <Card style={s.stat}>
            <Text style={s.big}>{parks.length}</Text>
            <T.Muted style={{ fontSize: 13 }}>parques</T.Muted>
          </Card>
          <Card style={s.stat}>
            <Text style={s.big}>{conquered}</Text>
            <T.Muted style={{ fontSize: 13 }}>con insignia</T.Muted>
          </Card>
          <Card style={s.stat}>
            <Text style={s.big}>{total}</Text>
            <T.Muted style={{ fontSize: 13 }}>minutos</T.Muted>
          </Card>
        </View>

        <Card style={{ gap: 6, backgroundColor: colors.lilacSoft }}>
          <T.Black>Cómo se conquista un parque</T.Black>
          <T.Body>
            Pasea en él y los minutos se suman: {PARK_BADGES.slice().reverse().map((b) => `${b.icon} ${b.label} ${b.min} min`).join(' · ')}. Cada parque nuevo da +{NEW_PARK_XP} XP.
          </T.Body>
        </Card>

        {parks.length === 0 && !adding ? <T.Muted>Aún no tienes parques. Añade el primero o elígelo al registrar un paseo.</T.Muted> : null}
        {parks.map(({ park, minutes, badge, next, visits, last }) => (
          <Pressable key={park.id} onPress={() => router.push({ pathname: '/parque', params: { id: park.id } })} style={s.park}>
            <Text style={{ fontSize: 28 }}>{badge?.icon ?? '🌳'}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <T.Black>{park.name}</T.Black>
              <T.Muted style={{ fontSize: 13 }}>
                {[park.barrio, `${visits.length} ${visits.length === 1 ? 'visita' : 'visitas'}`, last && `última ${when(last)}`].filter(Boolean).join(' · ')}
              </T.Muted>
              <Bar value={next ? (minutes / next.min) * 100 : 100} color={colors.found} />
              <T.Muted style={{ fontSize: 12 }}>{next ? `${minutes} de ${next.min} min para ${next.label}` : `${minutes} min · ¡Oro conseguido!`}</T.Muted>
            </View>
          </Pressable>
        ))}

        {adding ? (
          <Card style={{ gap: 8 }}>
            <T.Black>Parque nuevo</T.Black>
            <TextInput value={name} onChangeText={setName} placeholder="Nombre del parque" placeholderTextColor={colors.textMuted} style={s.input} />
            <TextInput value={barrio} onChangeText={setBarrio} placeholder="Barrio (opcional)" placeholderTextColor={colors.textMuted} style={s.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Button label="Guardar" kind="solid" style={{ flex: 1 }} disabled={!name.trim()} onPress={add} />
            </View>
          </Card>
        ) : (
          <Button label="+ Añadir parque" onPress={() => setAdding(true)} />
        )}
        <Button
          label="Ver parques en el mapa"
          kind="secondary"
          onPress={() => soon('Parques en el mapa', 'Verás los parques del barrio en el mapa, quién los ha conquistado y la app te sugerirá el parque donde estás. Necesita el GPS del teléfono.')}
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 28, color: colors.text },
  park: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, padding: 14 },
  input: {
    minHeight: 48,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.body,
  },
});
