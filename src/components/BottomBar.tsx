import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { colors, fonts, shadow } from '../lib/theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

// Barra flotante de la maqueta: Mi mascota · INICIO (Paseo) · Comunidad, y aparte el botón +.
// La pestaña abierta se ilumina en azul y su ícono crece; Inicio es el círculo grande del centro.
const TABS: Record<string, { label: string; icon: IconName }> = {
  mascota: { label: 'Mi mascota', icon: 'mascota' },
  index: { label: 'Inicio', icon: 'huella' },
  comunidad: { label: 'Comunidad', icon: 'comunidad' },
};

export function BottomBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: Math.max(insets.bottom, 12) + 12 }]}>
      <View style={[s.bar, shadow]}>
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const active = state.index === i;
          const color = active ? colors.accent : colors.textMuted;
          if (route.name === 'index') {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => navigateToTab(route.key)}
                style={[s.centerItem, { marginTop: active ? -58 : -42 }]}
              >
                <View style={[s.center, active ? s.centerActive : s.centerIdle]}>
                  <Icon name="huella" size={active ? 44 : 34} color={active ? '#FFFFFF' : colors.accent} />
                </View>
                <Text style={[s.label, { color, fontWeight: active ? '800' : '700' }]}>{tab.label}</Text>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => navigateToTab(route.key)}
              style={s.item}
            >
              <View style={[s.side, active && s.sideActive]}>
                <Icon name={tab.icon} size={active ? 30 : 24} color={color} strokeWidth={active ? 2.2 : 2} />
              </View>
              <Text style={[s.label, { color, fontWeight: active ? '800' : '700' }]}>{tab.label}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  item: { width: 76, alignItems: 'center', gap: 2 },
  side: { width: 52, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sideActive: {
    backgroundColor: colors.blueTint,
    shadowColor: colors.accent,
    shadowOpacity: 0.55,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  centerItem: { alignItems: 'center', gap: 2 },
  center: { borderWidth: 5, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  centerIdle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.blue,
    shadowColor: '#1F2A3A',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  centerActive: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 13,
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
