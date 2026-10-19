import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarrioMap } from '../components/BarrioMap';
import { Icon } from '../components/Icon';
import { Chips } from '../components/form';
import { BackHeader, Button, T } from '../components/ui';
import type { IconName } from '../components/Icon';
import { spotFor } from '../lib/barrio';
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

type Place = { id: string; cat: Category; name: string; detail?: string; address?: string; phone?: string; open?: () => void };

// Mapa de exploración: el barrio con tus lugares; se eligen una o varias categorías.
export default function Explorar() {
  const { data, savePark, saveVet, saveProvider } = useStore();
  const insets = useSafeAreaInsets();
  // Se pueden ver varias categorías a la vez; cada una aparece o desaparece del mapa.
  const [cats, setCats] = useState<Category[]>(['parques']);
  const [menu, setMenu] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addCat, setAddCat] = useState<Category>('parques');
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const shown = CATEGORIES.filter((c) => cats.includes(c.id));
  const info = (c: Category) => CATEGORIES.find((x) => x.id === c)!;
  const toggle = (c: Category) => setCats((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));

  const places = (c: Category): Place[] => {
    if (c === 'parques')
      return data.parks.map((p) => ({
        id: p.id,
        cat: c,
        name: p.name,
        detail: [p.barrio, `${parkStats(data.entries, p.id).minutes} min`].filter(Boolean).join(' · '),
        open: () => router.push({ pathname: '/parque', params: { id: p.id } }),
      }));
    if (c === 'veterinarias')
      return data.vets.map((v) => ({ id: v.id, cat: c, name: v.name, detail: [v.doctor, v.place].filter(Boolean).join(' · '), address: v.address, phone: v.phone }));
    return data.providers
      .filter((p) => p.type === c)
      .map((p) => ({ id: p.id, cat: c, name: p.name, detail: p.place, address: p.address, phone: p.phone }));
  };
  const list = shown.flatMap((c) => places(c.id));

  const add = () => {
    const name = form.name.trim();
    const address = form.address.trim() || undefined;
    const phone = form.phone.trim() || undefined;
    if (addCat === 'parques') savePark({ name, barrio: address });
    else if (addCat === 'veterinarias') saveVet({ name, address, phone });
    else saveProvider({ type: addCat, name, address, phone });
    if (!cats.includes(addCat)) setCats([...cats, addCat]);
    setForm({ name: '', address: '', phone: '' });
    setAdding(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Mapa de exploración" />
      <View style={s.map}>
        <BarrioMap
          initialWidth={1400}
          controlsBottom={28}
          markers={list.map((p) => ({
            id: p.id,
            ...spotFor(p.id),
            node: (
              <Pressable onPress={p.open} style={s.pin}>
                <View style={[s.pinLabel, softShadow]}>
                  <Text style={{ fontSize: 12 }}>{info(p.cat).emoji}</Text>
                  <T.Black style={{ fontSize: 11 }} numberOfLines={1}>
                    {p.name}
                  </T.Black>
                </View>
                <View style={[s.dot, { backgroundColor: info(p.cat).pin }]} />
              </Pressable>
            ),
          }))}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: menu }}
          onPress={() => setMenu(true)}
          style={[s.catBtn, softShadow]}
        >
          <Text style={{ fontSize: 18 }}>{shown.length === 1 ? shown[0].emoji : '🗺️'}</Text>
          <T.Black style={{ fontSize: 16 }}>
            {shown.length === 0 ? 'Elige qué ver' : shown.length === 1 ? shown[0].label : `${shown.length} categorías`}
          </T.Black>
          <Icon name="chevronDown" size={18} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={s.note}>Ubicaciones aproximadas · GPS muy pronto</Text>
      </View>

      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 30 }]} keyboardShouldPersistTaps="handled">
        {shown.length === 0 ? <T.Muted>Abre el menú y elige una o varias categorías.</T.Muted> : null}
        {shown.map((c) => {
          const items = places(c.id);
          return (
            <View key={c.id} style={{ gap: 8 }}>
              <T.Black>
                {c.emoji} {c.label} · {items.length}
              </T.Black>
              {items.length === 0 ? <T.Muted style={{ fontSize: 13 }}>Aún no tienes lugares guardados aquí.</T.Muted> : null}
              {items.map((p) => (
                <Pressable key={p.id} onPress={p.open} disabled={!p.open} style={s.place}>
                  <View style={[s.dot, { backgroundColor: c.pin }]} />
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
            </View>
          );
        })}
        {adding ? (
          <View style={[s.place, { flexDirection: 'column', alignItems: 'stretch', gap: 8 }]}>
            <T.Black>¿Qué tipo de lugar?</T.Black>
            <Chips options={CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.emoji }))} value={addCat} onChange={(id) => setAddCat(id as Category)} />
            <TextInput value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Nombre" placeholderTextColor={colors.textMuted} style={s.input} />
            <TextInput
              value={form.address}
              onChangeText={(address) => setForm({ ...form, address })}
              placeholder={addCat === 'parques' ? 'Barrio (opcional)' : 'Dirección o barrio (opcional)'}
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
            {addCat !== 'parques' && (
              <TextInput value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} placeholder="Teléfono (opcional)" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} style={s.input} />
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Button label="Guardar" kind="solid" style={{ flex: 1 }} disabled={!form.name.trim()} onPress={add} />
            </View>
          </View>
        ) : (
          <Button
            label="+ Añadir un lugar"
            onPress={() => {
              setAddCat(cats[0] ?? 'parques');
              setAdding(true);
            }}
          />
        )}
        <T.Muted style={{ fontSize: 12, color: colors.lilacText }}>
          Muy pronto verás también los lugares aliados registrados en la app y a tus amigos cerca.
        </T.Muted>
      </ScrollView>

      <Modal transparent visible={menu} animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable accessibilityLabel="Cerrar menú" style={s.backdrop} onPress={() => setMenu(false)} />
        <View style={[s.menu, shadow, { top: insets.top + 120 }]}>
          <T.Eyebrow style={{ paddingHorizontal: 8, paddingTop: 6 }}>ELIGE UNA O VARIAS</T.Eyebrow>
          {CATEGORIES.map((c) => {
            const on = cats.includes(c.id);
            return (
              <Pressable
                key={c.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={c.label}
                onPress={() => toggle(c.id)}
                style={[s.option, on && { backgroundColor: colors.blue }]}
              >
                <View style={[s.box, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                  {on ? <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>✓</Text> : null}
                </View>
                <Text style={{ fontSize: 18 }}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <T.Black style={{ fontSize: 15 }}>{c.label}</T.Black>
                  <T.Muted style={{ fontSize: 12 }}>{places(c.id).length} guardados</T.Muted>
                </View>
              </Pressable>
            );
          })}
          <View style={{ flexDirection: 'row', gap: 8, padding: 6 }}>
            <Button label="Todas" kind="secondary" style={{ flex: 1 }} onPress={() => setCats(CATEGORIES.map((c) => c.id))} />
            <Button label="Listo" kind="solid" style={{ flex: 1 }} onPress={() => setMenu(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  map: { height: 340, overflow: 'hidden', backgroundColor: colors.grass },
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
  pin: { alignItems: 'center', gap: 2, maxWidth: 160 },
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
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.grey, alignItems: 'center', justifyContent: 'center' },
  menu: { position: 'absolute', left: 16, width: 300, maxWidth: '92%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 6 },
});
