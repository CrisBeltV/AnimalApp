import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Bar, Button, Card, MenuRow, T } from '../components/ui';
import { ACHIEVEMENTS, computeStats, levelInfo, mood, totalXp } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts } from '../lib/theme';
import { Text } from '../components/Text';

// Mi perfil: el dueño, su nivel y sus mascotas.
export default function Perfil() {
  const { data, switchPet } = useStore();
  const pet = data.pet!;
  const others = (data.otherPets ?? []).filter((p) => p.pet);
  const lvl = levelInfo(totalXp(data));
  const won = ACHIEVEMENTS.filter((a) => data.unlocked.includes(a.id)).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Mi perfil" />
      <ScrollView contentContainerStyle={s.page}>
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <View style={s.avatar}>
            <Text style={s.initial}>{(data.ownerName[0] ?? '?').toUpperCase()}</Text>
          </View>
          <T.Display style={{ fontSize: 24 }}>{data.ownerName}</T.Display>
          <T.Muted>Engativá, Bogotá</T.Muted>
          <View style={{ alignSelf: 'stretch', gap: 6, marginTop: 6 }}>
            <View style={s.between}>
              <T.Black>Nivel {lvl.level}</T.Black>
              <T.Muted>{lvl.totalXp} XP</T.Muted>
            </View>
            <Bar value={lvl.progress * 100} color={colors.lilacStrong} />
          </View>
        </Card>

        <T.Black>Tus mascotas</T.Black>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.petThumb}>
              <PetDrawing species={pet.species} mood={mood(computeStats(data, Date.now()))} size={56} />
            </View>
            <View style={{ flex: 1 }}>
              <T.Black>{pet.name}</T.Black>
              <T.Muted>
                {pet.species === 'gato' ? 'Gato' : 'Perro'}
                {pet.breed ? ` · ${pet.breed}` : ''}
              </T.Muted>
            </View>
            <View style={s.active}>
              <Text style={s.activeText}>Activa</Text>
            </View>
          </View>
          {others.map((p, i) => (
            <Pressable
              key={`${p.pet?.name}-${p.pet?.createdAt}`}
              accessibilityRole="button"
              accessibilityLabel={`Cambiar a ${p.pet?.name}`}
              onPress={() => {
                switchPet(i);
                router.dismissTo('/');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={[s.petThumb, { backgroundColor: colors.grey }]}>
                <PetDrawing species={p.pet!.species} mood="normal" size={56} />
              </View>
              <View style={{ flex: 1 }}>
                <T.Black>{p.pet?.name}</T.Black>
                <T.Muted>
                  {p.pet?.species === 'gato' ? 'Gato' : 'Perro'}
                  {p.pet?.breed ? ` · ${p.pet.breed}` : ''}
                </T.Muted>
              </View>
              <T.Black style={{ fontSize: 13, color: colors.accent }}>Cambiar</T.Black>
            </Pressable>
          ))}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Editar mascota" style={{ flex: 1 }} onPress={() => router.push('/editar-mascota')} />
            <Button label="Agregar mascota" kind="solid" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/editar-mascota', params: { nueva: '1' } })} />
          </View>
        </Card>

        <Card style={{ padding: 8 }}>
          <MenuRow icon="insignia" tint="lilac" title="Logros" detail={`${won} de ${ACHIEVEMENTS.length} insignias`} onPress={() => router.push('/logros')} />
          <MenuRow icon="ajustes" tint="grey" title="Ajustes" detail="Tu nombre y tus datos" onPress={() => router.push('/ajustes')} />
        </Card>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: '#FFFFFF', fontFamily: fonts.display, fontWeight: '700', fontSize: 34 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  active: { paddingHorizontal: 10, height: 24, borderRadius: 12, backgroundColor: colors.accent, justifyContent: 'center' },
  activeText: { color: '#FFFFFF', fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  petThumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.blueTint, alignItems: 'center', justifyContent: 'center' },
});
