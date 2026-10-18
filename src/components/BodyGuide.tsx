import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

import { colors } from '../lib/theme';
import { T } from './ui';

// Guía visual de condición corporal, vista desde arriba.
export const CONDITIONS = [
  { id: 'flaco', label: 'Flaco', hint: 'Se ven las costillas y la cadera. Cintura muy marcada.' },
  { id: 'ideal', label: 'Ideal', hint: 'Costillas se sienten pero no se ven. Cintura visible.' },
  { id: 'sobrepeso', label: 'Sobrepeso', hint: 'Costillas difíciles de sentir. Sin cintura, lomo ancho.' },
];

function Silhouette({ kind, color }: { kind: string; color: string }) {
  // Cuerpo visto desde arriba: pecho, cintura y cadera cambian de ancho.
  const waist = kind === 'flaco' ? 9 : kind === 'ideal' ? 14 : 22;
  const chest = kind === 'sobrepeso' ? 22 : 18;
  const hip = kind === 'flaco' ? 13 : kind === 'ideal' ? 16 : 22;
  const d = `M40 22 C ${40 + chest} 26, ${40 + chest} 44, ${40 + waist} 56 C ${40 + hip} 66, ${40 + hip} 80, 40 86 C ${40 - hip} 80, ${40 - hip} 66, ${40 - waist} 56 C ${40 - chest} 44, ${40 - chest} 26, 40 22 Z`;
  return (
    <Svg width={80} height={104} viewBox="0 0 80 104">
      <Circle cx={40} cy={14} r={10} fill={color} />
      <Path d={d} fill={color} />
      <Line x1={40} y1={86} x2={40} y2={100} stroke={color} strokeWidth={5} strokeLinecap="round" />
      {kind === 'flaco' &&
        [34, 40, 46].map((y) => (
          <Line key={y} x1={40 - 12} y1={y} x2={40 + 12} y2={y} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.8} />
        ))}
      {kind === 'sobrepeso' && <Ellipse cx={40} cy={58} rx={14} ry={8} fill="#FFFFFF" opacity={0.25} />}
    </Svg>
  );
}

export function BodyGuide({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  return (
    <View style={s.row}>
      {CONDITIONS.map((c) => {
        const on = c.id === value;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={c.label}
            onPress={() => onChange(c.id)}
            style={[s.card, on && { borderColor: colors.accent, backgroundColor: colors.blue }]}
          >
            <Silhouette kind={c.id} color={on ? colors.accent : colors.lilacStrong} />
            <T.Black style={{ fontSize: 15 }}>{c.label}</T.Black>
            <T.Muted style={{ fontSize: 11, textAlign: 'center' }}>{c.hint}</T.Muted>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.grey,
    backgroundColor: colors.card,
  },
});
