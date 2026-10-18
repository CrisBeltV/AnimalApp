import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KIND_INFO, activityWord } from '../lib/game';
import { openEntry } from '../lib/routes';
import { colors, radius, softShadow, type } from '../lib/theme';
import type { Entry, Species } from '../lib/types';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type TProps = { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number };

// Textos con las fuentes de la maqueta: Fredoka para títulos y Nunito Sans para el resto.
export const T = {
  Display: ({ children, style, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[type.display, { fontSize: 28 }, style]}>
      {children}
    </Text>
  ),
  Body: ({ children, style, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[type.body, { fontSize: 15 }, style]}>
      {children}
    </Text>
  ),
  Bold: ({ children, style, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[type.bold, { fontSize: 15 }, style]}>
      {children}
    </Text>
  ),
  Black: ({ children, style, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[type.black, { fontSize: 16 }, style]}>
      {children}
    </Text>
  ),
  Muted: ({ children, style, numberOfLines }: TProps) => (
    <Text numberOfLines={numberOfLines} style={[type.bold, { fontSize: 14, color: colors.textMuted }, style]}>
      {children}
    </Text>
  ),
  Eyebrow: ({ children, style }: TProps) => (
    <Text style={[type.black, { fontSize: 12, letterSpacing: 0.7, color: colors.textMuted }, style]}>{children}</Text>
  ),
};

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonKind = 'primary' | 'solid' | 'secondary' | 'lost' | 'found';

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const k = BUTTONS[kind];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: k.bg, borderColor: k.border },
        (pressed || disabled) && { opacity: 0.55 },
        style,
      ]}
    >
      <Text style={[type.black, { fontSize: 16, color: k.fg, textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  );
}

const BUTTONS: Record<ButtonKind, { bg: string; border: string; fg: string }> = {
  primary: { bg: colors.blue, border: colors.blueOutline, fg: colors.text },
  solid: { bg: colors.accent, border: colors.accent, fg: '#FFFFFF' },
  secondary: { bg: colors.card, border: colors.grey, fg: colors.text },
  lost: { bg: colors.card, border: colors.lost, fg: colors.lostText },
  found: { bg: colors.card, border: colors.found, fg: colors.foundText },
};

export function Bar({ value, color = colors.accent, track = colors.grey }: { value: number; color?: string; track?: string }) {
  return (
    <View style={[styles.barTrack, { backgroundColor: track }]}>
      <View style={[styles.barFill, { width: `${Math.max(2, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

// Fila de menú con ícono redondo, título, detalle y flecha (menús Paseo ⌄ y Tu cuenta).
export function MenuRow({
  icon,
  title,
  detail,
  onPress,
  tint = 'blue',
}: {
  icon: IconName;
  title: string;
  detail?: string;
  onPress: () => void;
  tint?: 'blue' | 'lilac' | 'grey';
}) {
  const bg = tint === 'blue' ? colors.blue : tint === 'lilac' ? colors.lilacSoft : colors.grey;
  const fg = tint === 'blue' ? colors.accent : tint === 'lilac' ? colors.lilacText : colors.body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: colors.bg }]}>
      <View style={[styles.menuIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={20} color={fg} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <T.Black>{title}</T.Black>
        {detail ? <T.Muted style={{ fontSize: 13 }}>{detail}</T.Muted> : null}
      </View>
      <Icon name="chevronRight" size={18} color={colors.textMuted} strokeWidth={2.2} />
    </Pressable>
  );
}

export function BackHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.backHeader, { paddingTop: insets.top + 12 }]}>
      <Pressable
        accessibilityLabel="Volver"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={styles.backBtn}
      >
        <Icon name="atras" size={24} strokeWidth={2.4} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <T.Display style={{ fontSize: 24 }} numberOfLines={1}>
          {title}
        </T.Display>
        {subtitle ? <T.Muted>{subtitle}</T.Muted> : null}
      </View>
    </View>
  );
}

export function soon(title: string, text: string) {
  router.push({ pathname: '/pronto', params: { title, text } });
}

// Toca un registro para abrirlo y editarlo.
export function EntryRow({ entry, species }: { entry: Entry; species: Species }) {
  const info = KIND_INFO[entry.kind];
  const label = entry.kind === 'paseo' ? activityWord(species) : info.label;
  const detail =
    entry.kind === 'paseo'
      ? `${entry.minutes} min${entry.note ? ` · ${entry.note}` : ''}`
      : entry.kind === 'peso'
        ? `${String(entry.kg).replace('.', ',')} kg`
        : entry.kind === 'agua'
          ? `${entry.ml} ml`
          : (entry.note ?? '');
  return (
    <Pressable accessibilityHint="Abre el registro para editarlo" onPress={() => openEntry(entry)} style={styles.entry}>
      <Text style={{ fontSize: 22 }}>{info.icon}</Text>
      <View style={{ flex: 1 }}>
        <T.Black style={{ fontSize: 15 }}>{label}</T.Black>
        {detail ? <T.Muted style={{ fontSize: 13 }} numberOfLines={2}>{detail}</T.Muted> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {entry.photos?.length ? <Icon name="camara" size={16} color={colors.textMuted} /> : null}
        <T.Black style={{ fontSize: 13, color: colors.accent }}>+{entry.xp} XP</T.Black>
        <T.Muted style={{ fontSize: 12 }}>{when(entry.at)}</T.Muted>
      </View>
    </Pressable>
  );
}

export function when(at: number) {
  const d = new Date(at);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const yesterday = new Date(today.getTime() - 864e5).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `hoy ${time}`;
  if (yesterday) return `ayer ${time}`;
  return `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} ${time}`;
}

export const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16 },
  button: {
    minHeight: 52,
    borderWidth: 2,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden', flex: 1 },
  barFill: { height: '100%', borderRadius: 4 },
  menuRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.bg,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  pill: { ...softShadow },
});
