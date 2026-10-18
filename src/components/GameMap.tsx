import { StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { colors } from '../lib/theme';

// Mapa del barrio estilo juego (como Pokémon GO), dibujado igual que en la maqueta.
// Más adelante lo reemplaza un mapa real con la ubicación del teléfono.
export function GameMap() {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <Rect width={390} height={844} fill={colors.grass} />
      <Rect x={20} y={40} width={130} height={150} rx={22} fill={colors.block} />
      <Rect x={196} y={40} width={174} height={150} rx={22} fill={colors.block} />
      <Rect x={20} y={236} width={130} height={190} rx={22} fill={colors.block} />
      <Rect x={20} y={472} width={130} height={170} rx={22} fill={colors.block} />
      <Rect x={196} y={472} width={174} height={170} rx={22} fill={colors.block} />
      <Rect x={20} y={688} width={350} height={160} rx={22} fill={colors.block} />
      <Rect x={150} y={0} width={46} height={844} fill={colors.road} />
      <Rect x={0} y={190} width={390} height={46} fill={colors.road} />
      <Rect x={0} y={426} width={390} height={46} fill={colors.road} />
      <Rect x={0} y={642} width={390} height={46} fill={colors.road} />
      <Ellipse cx={290} cy={320} rx={80} ry={64} fill={colors.park} />
      <Circle cx={268} cy={304} r={18} fill={colors.tree} />
      <Circle cx={312} cy={336} r={14} fill={colors.tree} />
      <Circle
        cx={195}
        cy={450}
        r={190}
        fill="#FFFFFF"
        fillOpacity={0.12}
        stroke={colors.accent}
        strokeOpacity={0.45}
        strokeWidth={2}
        strokeDasharray="8 8"
      />
      <Path
        d="M173 450 C 173 380, 120 360, 120 300 S 220 260, 270 300"
        stroke={colors.accent}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
    </Svg>
  );
}
