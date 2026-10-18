import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import type { Mood } from '../lib/game';
import type { Species } from '../lib/types';

// Dibujo de la mascota en el estilo de la maqueta. Ocupa el lugar del modelo 3D
// hasta que lo construyamos con las fotos de cada mascota.
// Si está triste, el color se apaga, baja las orejas y aparece una lágrima.
export function PetDrawing({ species, mood, size = 112 }: { species: Species; mood: Mood; size?: number }) {
  const sad = mood === 'triste';
  const mouth =
    mood === 'feliz' ? (
      <Path d="M52 82 Q60 92 68 82" stroke="#1F2A3A" strokeWidth={2.5} fill="#E0736B" strokeLinecap="round" />
    ) : mood === 'normal' ? (
      <Path d="M53 84 Q60 87 67 84" stroke="#1F2A3A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    ) : (
      <Path d="M53 87 Q60 81 67 87" stroke="#1F2A3A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    );
  const tear = sad ? <Ellipse cx={44} cy={66} rx={2.5} ry={4} fill="#7FB3E6" /> : null;

  if (species === 'gato') {
    const fur = sad ? '#B9B4AE' : '#E8A65A';
    const ear = sad ? '#9C968F' : '#C9823A';
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path d={sad ? 'M26 56 L22 24 L50 40 Z' : 'M28 50 L34 14 L56 36 Z'} fill={ear} />
        <Path d={sad ? 'M94 56 L98 24 L70 40 Z' : 'M92 50 L86 14 L64 36 Z'} fill={ear} />
        <Ellipse cx={60} cy={64} rx={36} ry={32} fill={fur} />
        <Ellipse cx={60} cy={78} rx={16} ry={11} fill="#F6E3CC" />
        <Ellipse cx={46} cy={58} rx={5} ry={sad ? 3.5 : 6} fill="#2F6B3A" />
        <Ellipse cx={74} cy={58} rx={5} ry={sad ? 3.5 : 6} fill="#2F6B3A" />
        <Path d="M56 72 L64 72 L60 77 Z" fill="#D98A99" />
        {mouth}
        {tear}
      </Svg>
    );
  }

  const fur = sad ? '#B8AFA6' : '#D9A066';
  const ear = sad ? '#8E847B' : '#8B5E3C';
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d={sad ? 'M30 46 C14 40 8 70 24 84 Z' : 'M30 40 C16 18 4 52 22 74 Z'} fill={ear} />
      <Path d={sad ? 'M90 46 C106 40 112 70 96 84 Z' : 'M90 40 C104 18 116 52 98 74 Z'} fill={ear} />
      <Ellipse cx={60} cy={62} rx={34} ry={32} fill={fur} />
      <Ellipse cx={60} cy={79} rx={18} ry={13} fill="#F3D9B8" />
      <Circle cx={47} cy={56} r={4.5} fill="#1F2A3A" />
      <Circle cx={73} cy={56} r={4.5} fill="#1F2A3A" />
      <Ellipse cx={60} cy={72} rx={6} ry={4.5} fill="#1F2A3A" />
      {mouth}
      {tear}
    </Svg>
  );
}
