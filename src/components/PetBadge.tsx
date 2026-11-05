import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { Mood } from '../lib/game';
import { colors, softShadow } from '../lib/theme';
import type { Species } from '../lib/types';
import { PetDrawing } from './PetDrawing';
import { T } from './ui';

const RING: Record<Mood, string> = { feliz: colors.good, normal: colors.lilacStrong, triste: colors.warn };

// Medalla de la mascota en el mapa: su foto en un círculo con borde según el ánimo y el nombre
// debajo. Sin foto (o si el archivo ya no existe) muestra el dibujo.
export function PetBadge({
  name,
  species,
  mood,
  photo,
  size = 84,
}: {
  name: string;
  species: Species;
  mood: Mood;
  photo?: string;
  size?: number;
}) {
  const [broken, setBroken] = useState(false);
  const showPhoto = !!photo && !broken;
  return (
    <View style={s.wrap}>
      <View style={[s.shadow, { width: size * 0.8 }]} />
      <View style={[s.ring, softShadow, { width: size, height: size, borderRadius: size / 2, borderColor: RING[mood] }]}>
        {showPhoto ? (
          <Image
            source={{ uri: photo }}
            onError={() => setBroken(true)}
            style={{ width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }}
          />
        ) : (
          <PetDrawing species={species} mood={mood} size={size - 8} />
        )}
      </View>
      <View style={[s.name, softShadow]}>
        <T.Black style={{ fontSize: 13 }}>{name}</T.Black>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center' },
  shadow: { position: 'absolute', bottom: 18, height: 14, borderRadius: 7, backgroundColor: '#1F2A3A', opacity: 0.22 },
  ring: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: { marginTop: 6, height: 26, paddingHorizontal: 12, borderRadius: 13, backgroundColor: '#FFFFFF', justifyContent: 'center' },
});
