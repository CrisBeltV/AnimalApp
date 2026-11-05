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

  // Perro: beagle limón (pelaje claro, franja y hocico blancos, orejas largas y caídas), estilo de juego.
  // Feliz: ojos brillantes, lengüita y una chispa. Triste: tono apagado, orejas más caídas y una lágrima.
  const happy = mood === 'feliz';
  const fur = sad ? '#DCCBA6' : '#E8CB8E';
  const ear = sad ? '#B79A6E' : '#C99B5C';
  const light = sad ? '#F4EEE2' : '#FFF8E8';
  const ink = '#1F2A3A';
  const dogMouth = happy ? (
    <>
      <Path d="M48 81 Q60 101 72 81 Q60 87 48 81 Z" fill="#6B2233" />
      <Ellipse cx={60} cy={92} rx={6} ry={4.5} fill="#F2788A" />
    </>
  ) : sad ? (
    <Path d="M52 89 Q60 83 68 89" stroke={ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
  ) : (
    <Path d="M50 82 Q60 91 70 82" stroke={ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d={sad ? 'M30 48 C10 46 4 84 16 106 C26 112 36 90 38 64 Z' : 'M30 30 C8 28 2 70 14 96 C24 102 36 80 38 52 Z'} fill={ear} />
      <Path d={sad ? 'M90 48 C110 46 116 84 104 106 C94 112 84 90 82 64 Z' : 'M90 30 C112 28 118 70 106 96 C96 102 84 80 82 52 Z'} fill={ear} />
      <Ellipse cx={60} cy={62} rx={37} ry={33} fill={fur} />
      <Path d="M60 30 C52 40 52 52 60 58 C68 52 68 40 60 30 Z" fill={light} />
      {!sad && <Circle cx={34} cy={74} r={5} fill="#F7A8A0" opacity={0.55} />}
      {!sad && <Circle cx={86} cy={74} r={5} fill="#F7A8A0" opacity={0.55} />}
      <Ellipse cx={60} cy={78} rx={19} ry={14} fill={light} />
      <Ellipse cx={45} cy={56} rx={6} ry={sad ? 5 : 6} fill={ink} />
      <Ellipse cx={75} cy={56} rx={6} ry={sad ? 5 : 6} fill={ink} />
      <Circle cx={47} cy={sad ? 55 : 54} r={2} fill="#FFFFFF" />
      <Circle cx={77} cy={sad ? 55 : 54} r={2} fill="#FFFFFF" />
      <Ellipse cx={60} cy={70} rx={7} ry={5} fill="#2B2B3A" />
      <Ellipse cx={58} cy={68} rx={2} ry={1.2} fill="#FFFFFF" opacity={0.7} />
      <Path d="M60 75 L60 80" stroke={ink} strokeWidth={2} strokeLinecap="round" />
      {dogMouth}
      {tear}
      {happy && <Path d="M104 12 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" fill="#FFD54A" />}
    </Svg>
  );
}
