import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

// Una isla flotante por parque (Tus lugares y ficha del parque).
export function Island({ size = 150, locked = false, flag = false }: { size?: number; locked?: boolean; flag?: boolean }) {
  const rock = locked ? '#B9BFC9' : '#8C6FD6';
  const rockDark = locked ? '#9AA1AD' : '#6E52B8';
  const grass = locked ? '#D5DAE1' : '#8CCBA6';
  const grassTop = locked ? '#E4E8ED' : '#B7E4C7';
  const tree = locked ? '#AEB5C0' : '#1FA3C9';
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 150 120">
      <Path d="M18 58 L132 58 L112 92 L88 112 L62 110 L36 90 Z" fill={rock} />
      <Path d="M62 110 L88 112 L112 92 L96 84 L70 96 Z" fill={rockDark} />
      <Ellipse cx={75} cy={58} rx={60} ry={20} fill={grass} />
      <Ellipse cx={75} cy={54} rx={56} ry={16} fill={grassTop} />
      <Rect x={44} y={34} width={4} height={14} rx={2} fill="#6B5544" />
      <Circle cx={46} cy={30} r={12} fill={tree} />
      <Rect x={100} y={38} width={4} height={12} rx={2} fill="#6B5544" />
      <Circle cx={102} cy={34} r={10} fill={tree} />
      <Circle cx={60} cy={44} r={7} fill={tree} />
      {flag ? (
        <>
          <Rect x={78} y={20} width={3} height={34} fill="#1F2A3A" />
          <Path d="M81 20 L100 26 L81 33 Z" fill="#2A64A8" />
        </>
      ) : null}
    </Svg>
  );
}
