import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameMap } from '../components/GameMap';
import { PetDrawing } from '../components/PetDrawing';
import { Bar, Button, T } from '../components/ui';
import { WALK_GOALS, activityWord, computeStats, mood } from '../lib/game';
import { clock } from '../lib/format';
import { useStore } from '../lib/store';
import { colors, fonts, shadow } from '../lib/theme';
import { useNow } from '../lib/useNow';

// Paseo en curso: cronómetro sobre el mapa con la mascota acompañándote.
export default function PaseoEnCurso() {
  const { data, startWalk, finishWalk, cancelWalk } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow(1000);
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const start = data.activeWalkStart;
  const elapsed = start ? now - start : 0;
  const minutes = elapsed / 60000;
  const next = WALK_GOALS.find((g) => g > minutes);

  function finish() {
    const m = finishWalk();
    router.replace({ pathname: '/resumen', params: { min: String(m) } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.grass }}>
      <GameMap />
      <View style={[s.petSpot]}>
        <PetDrawing species={pet.species} mood={mood(computeStats(data, now))} size={120} />
      </View>

      <View style={[s.panel, shadow, { paddingBottom: insets.bottom + 20 }]}>
        {start ? (
          <>
            <View style={s.stats}>
              <View style={s.stat}>
                <Text style={s.big}>{clock(elapsed)}</Text>
                <T.Eyebrow>TIEMPO</T.Eyebrow>
              </View>
              <View style={s.stat}>
                <Text style={s.big}>+{Math.max(0, Math.floor(minutes))}</Text>
                <T.Eyebrow>PUNTOS</T.Eyebrow>
              </View>
            </View>
            <T.Bold style={{ textAlign: 'center' }}>
              {next ? `Próxima meta: ${next} min · +10 XP extra` : '¡Cumpliste las 3 metas de hoy!'}
            </T.Bold>
            <Bar value={next ? (minutes / next) * 100 : 100} />
            <Button label={`Terminar ${word.toLowerCase()}`} kind="solid" onPress={finish} />
            <Button label="Cancelar" kind="secondary" onPress={() => { cancelWalk(); router.back(); }} />
          </>
        ) : (
          <>
            <T.Display style={{ fontSize: 24, textAlign: 'center' }}>¿Listos para salir?</T.Display>
            <T.Body style={{ textAlign: 'center' }}>
              Cada minuto suma un punto. Las metas de 15, 30 y 45 minutos dan XP extra.
            </T.Body>
            <Button label={`Iniciar ${word.toLowerCase()} con ${pet.name}`} kind="solid" onPress={startWalk} />
            <Button label="Volver" kind="secondary" onPress={() => router.back()} />
          </>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  petSpot: { position: 'absolute', left: '50%', top: '28%', marginLeft: -60 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  big: { fontFamily: fonts.display, fontWeight: '700', fontSize: 44, color: colors.text },
});
