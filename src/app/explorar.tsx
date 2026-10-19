import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameMap } from '../components/GameMap';
import { Icon } from '../components/Icon';
import { BackHeader, Button, MenuRow, T } from '../components/ui';
import type { IconName } from '../components/Icon';
import { parkStats } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts, radius, shadow, softShadow } from '../lib/theme';
import type { ProviderType } from '../lib/types';

type Category = 'parques' | 'veterinarias' | ProviderType;

const CATEGORIES: { id: Category; label: string; icon: IconName; pin: string; emoji: string }[] = [
  { id: 'parques', label: 'Parques', icon: 'bandera', pin: colors.found, emoji: '🌳' },
  { id: 'tienda', label: 'Tiendas de mascotas', icon: 'tienda', pin: colors.accent, emoji: '🛍️' },
  { id: 'veterinarias', label: 'Veterinarias', icon: 'cita', pin: colors.lost, emoji: '🩺' },
  { id: 'restaurante', label: 'Restaurantes pet friendly', icon: 'comida', pin: colors.warn, emoji: '🍽️' },
  { id: 'peluqueria', label: 'Peluquerías', icon: 'cuerpo', pin: colors.lilacStrong, emoji: '✂️' },
  { id: 'paseador', label: 'Paseadores', icon: 'huella', pin: '#4F9BE0', emoji: '🦮' },
  { id: 'guarderia', label: 'Guarderías', icon: 'mascota', pin: '#E07A4F', emoji: '🏠' },
  { id: 'otro', label: 'Otros lugares', icon: 'mapa', pin: colors.textMuted, emoji: '📍' },
];

type Place = { id: string; name: string; detail?: string; address?: string; phone?: string; open?: () => void };

// Posición fija pero aproximada en el dibujo del mapa, hasta tener GPS.
function spot(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { left: `${12 + (h % 70)}%` as const, top: `${18 + ((h >> 8) % 45)}%` as const };
}

// Mapa de exploración: el barrio con tus lugares por categoría.
export default function Explorar() {
  const { data, savePark, saveVet, saveProvider } = useStore();
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<Category>('parques');
  const [menu, setMenu] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const current = CATEGORIES.find((c) => c.id === cat)!;

  const places = (c: Category): Place[] => {
    if (c === 'parques')
      return data.parks.map((p) => ({
        id: p.id,
        name: p.name,
        detail: [p.barrio, `${parkStats(data.entries, p.id).minutes} min`].filter(Boolean).join(' · '),
        open: () => router.push({ pathname: '/parque', params: { id: p.id } }),
      }));
    if (c === 'veterinarias')
      return data.vets.map((v) => ({ id: v.id, name: v.name, detail: [v.doctor, v.place].filter(Boolean).join(' · '), address: v.address, phone: v.phone }));
    return data.providers
      .filter((p) => p.type === c)
      .map((p) => ({ id: p.id, name: p.name, detail: p.place, address: p.address, phone: p.phone }));
  };
  const list = places(cat);

  const add = () => {
    const name = form.name.trim();
    const address = form.address.trim() || undefined;
    const phone = form.phone.trim() || undefined;
    if (cat === 'parques') savePark({ name, barrio: address });
    else if (cat === 'veterinarias') saveVet({ name, address, phone });
    else saveProvider({ type: cat, name, address, phone });
    setForm({ name: '', address: '', phone: '' });
    setAdding(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Mapa de exploración" />
      <View style={s.map}>
        <GameMap />
        {list.slice(0, 12).map((p) => (
          <Pressable key={p.id} onPress={p.open} style={[s.pin, spot(p.id)]}>
            <View style={[s.pinLabel, softShadow]}>
              <Text style={{ fontSize: 12 }}>{current.emoji}</Text>
              <T.Black style={{ fontSize: 11 }} numberOfLines={1}>
                {p.name}
              </T.Black>
            </View>
            <View style={[s.dot, { backgroundColor: current.pin }]} />
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: menu }}
          onPress={() => setMenu(true)}
          style={[s.catBtn, softShadow]}
        >
          <Text style={{ fontSize: 18 }}>{current.emoji}</Text>
          <T.Black style={{ fontSize: 16 }}>{current.label}</T.Black>
          <Icon name="chevronDown" size={18} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={s.note}>Ubicaciones aproximadas · mapa real con GPS muy pronto</Text>
      </View>

      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
        <T.Black>
          {current.label} · {list.length}
        </T.Black>
        {list.length === 0 && !adding ? <T.Muted>Aún no tienes lugares guardados aquí.</T.Muted> : null}
        {list.map((p) => (
          <Pressable key={p.id} onPress={p.open} disabled={!p.open} style={s.place}>
            <Text style={{ fontSize: 22 }}>{current.emoji}</Text>
            <View style={{ flex: 1 }}>
              <T.Black>{p.name}</T.Black>
              {p.detail || p.address || p.phone ? (
                <T.Muted style={{ fontSize: 13 }}>{[p.detail, p.address, p.phone].filter(Boolean).join(' · ')}</T.Muted>
              ) : null}
            </View>
            {p.address ? (
              <Pressable
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address}, Bogotá`)}`)}
                style={s.small}
              >
                <T.Black style={{ fontSize: 13, color: colors.accent }}>Mapa</T.Black>
              </Pressable>
            ) : p.open ? (
              <Icon name="chevronRight" size={18} color={colors.textMuted} />
            ) : null}
          </Pressable>
        ))}
        {adding ? (
          <View style={[s.place, { flexDirection: 'column', alignItems: 'stretch', gap: 8 }]}>
            <TextInput value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Nombre" placeholderTextColor={colors.textMuted} style={s.input} />
            <TextInput
              value={form.address}
              onChangeText={(address) => setForm({ ...form, address })}
              placeholder={cat === 'parques' ? 'Barrio (opcional)' : 'Dirección o barrio (opcional)'}
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
            {cat !== 'parques' && (
              <TextInput value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} placeholder="Teléfono (opcional)" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} style={s.input} />
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Button label="Guardar" kind="solid" style={{ flex: 1 }} disabled={!form.name.trim()} onPress={add} />
            </View>
          </View>
        ) : (
          <Button label={`+ Añadir a ${current.label.toLowerCase()}`} onPress={() => setAdding(true)} />
        )}
        <T.Muted style={{ fontSize: 12, color: colors.lilacText }}>
          Muy pronto verás también los lugares aliados registrados en la app y a tus amigos cerca.
        </T.Muted>
      </ScrollView>

      <Modal transparent visible={menu} animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable accessibilityLabel="Cerrar menú" style={s.backdrop} onPress={() => setMenu(false)} />
        <View style={[s.menu, shadow, { top: insets.top + 120 }]}>
          {CATEGORIES.map((c) => (
            <MenuRow
              key={c.id}
              compact
              icon={c.icon}
              title={c.label}
              detail={`${places(c.id).length} guardados`}
              tint={c.id === cat ? 'blue' : 'grey'}
              onPress={() => {
                setCat(c.id);
                setAdding(false);
                setMenu(false);
              }}
            />
          ))}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  map: { height: 300, overflow: 'hidden', backgroundColor: colors.grass },
  catBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  pin: { position: 'absolute', alignItems: 'center', gap: 2, maxWidth: 140 },
  pinLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 3, borderColor: '#FFFFFF' },
  note: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    fontWeight: '700',
    color: '#2E6B3F',
  },
  page: { paddingHorizontal: 16, paddingTop: 14, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: colors.card },
  small: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.blue },
  input: {
    minHeight: 46,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.body,
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  menu: { position: 'absolute', left: 16, width: 300, maxWidth: '92%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 6 },
});
