import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { colors, fonts, shadow } from '../lib/theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

// Barra flotante de la maqueta: Mi mascota · INICIO (Paseo) · Comunidad, y aparte el botón +.
// Los tres botones son del mismo tamaño; el elegido crece, con fondo azul e ícono blanco.
const TABS: Record<string, { label: string; icon: IconName }> = {
  mascota: { label: 'Mi mascota', icon: 'mascota' },
  index: { label: 'Inicio', icon: 'huella' },
  comunidad: { label: 'Comunidad', icon: 'comunidad' },
};

export function BottomBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: Math.max(insets.bottom, 12) + 12 }]}>
      <View style={[s.bar, shadow]}>
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const active = state.index === i;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              onPress={() => navigation.navigate(route.name)}
              style={[s.item, { marginTop: active ? -34 : 0 }]}
            >
              <View style={[s.circle, active ? s.circleActive : s.circleIdle]}>
                <Icon name={tab.icon} size={active ? 34 : 24} color={active ? '#FFFFFF' : colors.accent} strokeWidth={active ? 2.4 : 2} />
              </View>
              <Text style={[s.label, { color: active ? colors.accent : colors.textMuted, fontWeight: active ? '800' : '700' }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable accessibilityLabel="Añadir rápidamente" onPress={() => router.push('/registro')} style={[s.plus, shadow]}>
        <Icon name="mas" size={26} color={colors.text} strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    maxWidth: 528,
    alignSelf: 'center',
  },
  bar: {
    flex: 1,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  circle: { alignItems: 'center', justifyContent: 'center' },
  circleIdle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue },
  circleActive: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.55,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  label: { fontSize: 12, fontFamily: fonts.bodyBlack },
  plus: {
    width: 58,
    height: 58,
    marginBottom: 5,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
