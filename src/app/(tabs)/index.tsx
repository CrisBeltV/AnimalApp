import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountButton } from '../../components/AccountButton';
import { GameMap } from '../../components/GameMap';
import { Icon } from '../../components/Icon';
import { PetDrawing } from '../../components/PetDrawing';
import { Bar, MenuRow, T, soon } from '../../components/ui';
import {
  MISSION_XP,
  activityWord,
  computeStats,
  minutesOn,
  missionGoal,
  mood,
  startOfDay,
} from '../../lib/game';
import { clock } from '../../lib/format';
import { useStore } from '../../lib/store';
import { colors, fonts, shadow, softShadow } from '../../lib/theme';
import { useNow } from '../../lib/useNow';

// INICIO = Paseo, el corazón de la app: el barrio como mapa de juego con tu mascota en el centro.
export default function Inicio() {
  const { data, startWalk } = useStore();
  const insets = useSafeAreaInsets();
  const walking = data.activeWalkStart !== null;
  const now = useNow(walking ? 1000 : 30000);
  const [menu, setMenu] = useState(false);
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const petMood = mood(computeStats(data, now));

  const goal = missionGoal(pet.species);
  const today = minutesOn(data.entries, startOfDay(now));
  const done = today >= goal;

  const goWalk = () => {
    setMenu(false);
    if (!walking) startWalk();
    router.push('/paseo');
  };
  const later = (title: string, text: string) => () => {
    setMenu(false);
    soon(title, text);
  };

  return (
    <View style={s.screen}>
      <GameMap />

      <View style={[s.topRow, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setMenu(true)}
          accessibilityRole="button"
          accessibilityState={{ expanded: menu }}
          style={[s.paseoBtn, softShadow]}
        >
          <T.Display style={{ fontSize: 28 }}>{word}</T.Display>
          <Icon name="chevronDown" size={22} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <AccountButton />
      </View>

      <View style={[s.mission, shadow, { top: insets.top + 74 }]}>
        <T.Eyebrow>MISIÓN DEL DÍA</T.Eyebrow>
        <T.Display style={{ fontSize: 18 }}>
          {done ? `¡Misión cumplida con ${pet.name}!` : `${word === 'Juego' ? 'Juega' : 'Pasea'} ${goal} min con ${pet.name}`}
        </T.Display>
        <View style={s.missionRow}>
          <Bar value={(today / goal) * 100} />
          <T.Black style={{ fontSize: 14 }}>
            {Math.min(Math.round(today), goal)}/{goal} min · +{MISSION_XP} XP
          </T.Black>
        </View>
      </View>

      {walking && (
        <Pressable onPress={() => router.push('/paseo')} style={[s.walkBanner, shadow, { top: insets.top + 186 }]}>
          <View style={s.liveDot} />
          <T.Black style={{ flex: 1, color: '#FFFFFF' }}>{word} en curso</T.Black>
          <Text style={s.walkClock}>{clock(now - data.activeWalkStart!)}</Text>
          <Icon name="chevronRight" size={18} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      )}

      <Pressable
        accessibilityLabel="Conquista de parques"
        onPress={() => soon('Conquista de parques', 'Visita parques con tu mascota para conquistarlos y ganar puntos. Necesita la ubicación del teléfono, que llega en la siguiente versión.')}
        style={[s.flag, softShadow, { top: insets.top + (walking ? 244 : 186) }]}
      >
        <Icon name="bandera" size={22} color={colors.accent} strokeWidth={2.4} />
      </Pressable>

      <Pressable
        onPress={() => soon('Ficha del parque', 'Cada parque tendrá su ficha con reseñas, retos y quién lo conquistó.')}
        style={[s.pin, { left: '60%', top: '36%' }]}
      >
        <View style={[s.pinLabel, softShadow]}>
          <T.Black style={s.pinText}>Parque nuevo · +30</T.Black>
        </View>
        <View style={[s.pinDot, { backgroundColor: colors.accent, width: 34, height: 34 }]}>
          <Icon name="estrella" size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
      </Pressable>

      <Pressable onPress={() => router.push('/perdidas')} style={[s.pin, { left: '4%', top: '37%' }]}>
        <View style={[s.pinLabel, softShadow]}>
          <View style={[s.smallDot, { backgroundColor: colors.lost }]} />
          <T.Black style={s.pinText}>Perdido · Rocky · 600 m</T.Black>
        </View>
        <View style={[s.pinDot, s.lostHalo, { backgroundColor: colors.lost, width: 40, height: 40 }]}>
          <Icon name="huella" size={18} color="#FFFFFF" />
        </View>
      </Pressable>

      <Pressable onPress={() => router.push('/perdidas')} style={[s.pin, { left: '56%', top: '63%' }]}>
        <View style={[s.pinLabel, softShadow]}>
          <View style={[s.smallDot, { backgroundColor: colors.found }]} />
          <T.Black style={s.pinText}>Encontrado · 1,1 km</T.Black>
        </View>
        <View style={[s.pinDot, { backgroundColor: colors.found, width: 36, height: 36 }]}>
          <Icon name="huella" size={16} color="#FFFFFF" />
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel={`${pet.name}, tu mascota`}
        onPress={() => router.navigate('/mascota')}
        style={s.petSpot}
      >
        <View style={s.petShadow} />
        <PetDrawing species={pet.species} mood={petMood} size={112} />
        <View style={[s.petName, softShadow]}>
          <T.Black style={{ fontSize: 13 }}>{pet.name}</T.Black>
        </View>
      </Pressable>

      <Text style={[s.exampleNote, { bottom: insets.bottom + 168 }]}>Pines de ejemplo · mapa real con GPS en la siguiente versión</Text>

      <Modal transparent visible={menu} animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable accessibilityLabel="Cerrar menú" style={s.backdrop} onPress={() => setMenu(false)} />
        <View style={[s.menu, shadow, { top: insets.top + 68 }]}>
          <T.Eyebrow style={s.group}>{word === 'Juego' ? 'JUEGOS' : 'PASEOS'}</T.Eyebrow>
          <MenuRow
            icon="reloj"
            title={walking ? `${word} en curso` : `Iniciar ${word.toLowerCase()} con ${pet.name}`}
            detail={walking ? `Llevas ${clock(now - data.activeWalkStart!)}` : 'Tiempo y metas en vivo'}
            onPress={goWalk}
          />
          <MenuRow
            icon="lista"
            title={`Resumen de ${word === 'Juego' ? 'juegos' : 'paseos'}`}
            detail={`Hoy: ${Math.round(today)} min`}
            onPress={() => {
              setMenu(false);
              router.push('/resumen');
            }}
          />
          <MenuRow
            icon="mapa"
            title="Mapa de exploración"
            detail="El barrio con tus amigos cerca"
            onPress={later('Mapa de exploración', 'Verás el barrio con tus amigos y sus mascotas cerca. Necesita GPS y cuentas en la nube.')}
          />
          <T.Eyebrow style={s.group}>CONQUISTA DE PARQUES</T.Eyebrow>
          <MenuRow
            icon="bandera"
            tint="lilac"
            title="Conquista de parques"
            detail="Gana parques paseando en ellos"
            onPress={later('Conquista de parques', 'Visita parques con tu mascota para conquistarlos y ganar puntos.')}
          />
          <MenuRow
            icon="estrella"
            tint="lilac"
            title="Ficha del parque"
            detail="Reseñas y retos de cada parque"
            onPress={later('Ficha del parque', 'Cada parque tendrá su ficha con reseñas, retos y quién lo conquistó.')}
          />
          <MenuRow
            icon="mapa"
            tint="lilac"
            title="Tus lugares"
            detail="Parques, veterinarias y tiendas"
            onPress={later('Tus lugares', 'Guarda tus parques, veterinarias y tiendas de confianza en Engativá.')}
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.grass, overflow: 'hidden' },
  topRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paseoBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 14,
  },
  mission: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walkBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#9EE6A8' },
  walkClock: { color: '#FFFFFF', fontFamily: fonts.display, fontWeight: '700', fontSize: 20 },
  flag: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: { position: 'absolute', alignItems: 'center', gap: 4 },
  pinLabel: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinText: { fontSize: 12 },
  smallDot: { width: 8, height: 8, borderRadius: 4 },
  pinDot: { borderRadius: 999, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  lostHalo: {
    shadowColor: colors.lost,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  petSpot: { position: 'absolute', left: '50%', top: '46%', marginLeft: -56, width: 112, alignItems: 'center' },
  petShadow: {
    position: 'absolute',
    top: 96,
    width: 72,
    height: 16,
    borderRadius: 36,
    backgroundColor: '#1F2A3A',
    opacity: 0.22,
  },
  petName: {
    marginTop: 6,
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  exampleNote: {
    position: 'absolute',
    left: 16,
    right: 16,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    fontSize: 11,
    color: '#2E6B3F',
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  menu: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 8,
  },
  group: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 2 },
});
